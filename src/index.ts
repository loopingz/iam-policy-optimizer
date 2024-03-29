#!/usr/bin/env node
import * as fs from "fs";
import { IAMClient, GetPolicyCommand, GetPolicyVersionCommand, CreatePolicyVersionCommand } from "@aws-sdk/client-iam";

export default class IamPolicyOptimizer {
  static POLICY_LIMIT = 6144;
  static IAMEndpoint = undefined;

  /**
   * Reduce from a stringified policy version
   *
   * @param policy JSON stringified version of the policy
   * @returns Optimized JSON stringified version of the policy
   */
  static reduce(policy: string): string {
    return JSON.stringify(this.reducePolicyObject(JSON.parse(policy)), undefined, 2);
  }

  /**
   * Optimize the resources array
   *
   * @internal
   */
  static optimizeResource(arg: string[]) {
    // First remove any duplicate
    let res = [...new Set(arg)];
    let toRemove = [];
    res.forEach(p => {
      if (!p.endsWith("*")) return;
      let rep = p.substring(0, p.length - 2);
      res.forEach(m => {
        if (m === p) return;
        if (m.startsWith(rep)) {
          toRemove.push(m);
        }
      });
    });
    return res.filter(p => toRemove.indexOf(p) < 0);
  }

  /**
   * Reduce the policy object to its minimal form
   * @param policy
   * @returns
   */
  static reducePolicyObject(policy: any): any {
    let newPolicy = {
      Version: policy.Version,
      Statement: []
    };
    let commands = { Allow: {}, Deny: {} };
    // Decompose for each action
    // Action wildcard might still be optimized
    policy.Statement.forEach(st => {
      if (typeof st.Action === "string") {
        st.Action = [st.Action];
      }
      st.Action.forEach(action => {
        commands[st.Effect][action] = commands[st.Effect][action] || [];
        if (typeof st.Resource === "string") {
          commands[st.Effect][action].push(st.Resource);
        } else {
          st.Resource.forEach(r => commands[st.Effect][action].push(r));
        }
      });
    });
    let sids = 1;
    Object.keys(commands).forEach(Effect => {
      // Optimize resources per action
      for (let action in commands[Effect]) {
        commands[Effect][action] = IamPolicyOptimizer.optimizeResource(commands[Effect][action]);
      }
      // Recompose
      let newMap = {};
      Object.keys(commands[Effect]).forEach(action => {
        let key = commands[Effect][action].sort().join("|");
        newMap[key] = newMap[key] || [];
        newMap[key].push(action);
      });
      // Add to new policy
      for (let i in newMap) {
        // Remove array if only one item
        let Action: any = newMap[i];
        let Resource: any = i.split("|");
        if (Resource.length === 1) {
          Resource = Resource[0];
        }
        if (Action.length === 1) {
          Action = Action[0];
        }
        newPolicy.Statement.push({
          Sid: (sids++).toString(36),
          Effect,
          Action,
          Resource
        });
      }
    });

    if (JSON.stringify(newPolicy).length > IamPolicyOptimizer.POLICY_LIMIT) {
      console.error("Reduced policy is still too big", JSON.stringify(newPolicy).length);
    }

    return newPolicy;
  }

  /**
   * Return the arguments for CLI
   */
  static getArgv() {
    return require("yargs")
      .option("arn", {
        type: "string",
        description: "Load from IAM Policy arn"
      })
      .option("save", {
        type: "boolean",
        description: "Update the IAM Policy in-place"
      }).argv;
  }

  /**
   * Add command line management
   */
  static async commandLine() {
    const argv = IamPolicyOptimizer.getArgv();
    // IAM
    if (argv.arn) {
      let iam = new IAMClient({
        endpoint: IamPolicyOptimizer.IAMEndpoint,
        region: "us-east-1"
      });
      try {
        let { Policy } = await iam.send(new GetPolicyCommand({ PolicyArn: argv.arn }));
        let {
          PolicyVersion: { Document }
        } = await iam.send(
          new GetPolicyVersionCommand({
            PolicyArn: argv.arn,
            VersionId: Policy.DefaultVersionId
          })
        );
        let result = IamPolicyOptimizer.reduce(Document);
        if (argv.save) {
          // Update in IAM
          if (result.trim() === Document.trim()) {
            return;
          }
          await iam.send(
            new CreatePolicyVersionCommand({
              PolicyArn: argv.arn,
              PolicyDocument: result,
              SetAsDefault: true
            })
          );
          return;
        } else {
          console.log(result);
        }
      } catch (err) {
        console.log("Error occured", err);
      }
    } else {
      let file = argv._[0];
      if (!file) {
        console.log("iam-policy-generator must use either --arn or a file argument");
        return;
      }
      if (file === "-") {
        file = 0;
      } else {
        if (!fs.existsSync(file)) {
          console.log(`File ${file} was not found`);
          return;
        }
      }
      console.log(IamPolicyOptimizer.reduce(fs.readFileSync(file).toString()));
    }
  }
}

// If called as main launch the CLI
/* istanbul ignore next */
if (require.main === module) {
  IamPolicyOptimizer.commandLine();
}
