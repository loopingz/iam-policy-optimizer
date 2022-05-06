import { suite, test } from "mocha-typescript";
import IamPolicyOptimizer from "./index";
import * as fs from "fs";
import * as assert from "assert";
import * as AWS from "aws-sdk";

const GetArgv = IamPolicyOptimizer.getArgv;
IamPolicyOptimizer.getArgv = () => {
  return {
    _: []
  };
};

@suite
class IamPolicyOptimizerTest {
  getSamplePolicy(): string {
    return fs
      .readFileSync(__dirname + "/../test/policy.json")
      .toString()
      .trim();
  }
  getSampleOptimizedPolicy(): string {
    return fs
      .readFileSync(__dirname + "/../test/policy.optimized.json")
      .toString()
      .trim();
  }

  @test
  complexScenario() {
    let policy = this.getSamplePolicy();
    let oldSize = JSON.stringify(JSON.parse(policy)).length;
    let newPolicy: any = IamPolicyOptimizer.reduce(policy);
    let newSize = JSON.stringify(JSON.parse(newPolicy)).length;
    assert.equal(oldSize > newSize, true, "Policy should be smaller");
  }

  @test
  oversizedReducedPolicy() {
    let newPolicy = {
      Version: "2018-00-00",
      Statement: []
    };
    let oversizedMsg = false;
    console.error = (...args) => {
      assert.equal(args[0], "Reduced policy is still too big");
      oversizedMsg = true;
    };
    for (let i = 0; i < 1000; i++) {
      newPolicy.Statement.push({
        Sid: `ThisIsMySid${i}`,
        Effect: "Allow",
        Action: "s3:*",
        Resource: [`ThisIsMyResource${i}`, `ThisIsMyOtherResource${i}`]
      });
    }
    IamPolicyOptimizer.reducePolicyObject(newPolicy);
    assert.equal(
      oversizedMsg,
      true,
      "Oversize message should have been displayed"
    );
  }

  comparePolicies(p1: string, p2: string) {
    assert.equal(
      JSON.stringify(JSON.parse(p1)),
      JSON.stringify(JSON.parse(p2))
    );
  }

  async cleanPolicy(iam) {
    try {
      let policies = (await iam
        .listPolicies({ Scope: "Local" })
        .promise()).Policies.filter(p => p.PolicyName === "TestPolicy");
      if (!policies.length) {
        return;
      }
      await iam.deletePolicy({ PolicyArn: policies[0].Arn }).promise();
    } catch (err) {}
  }

  @test
  async commandLineFile() {
    const original = console.log;
    let result = "";
    console.log = (...args) => {
      args.forEach(arg => (result += arg.toString()));
    };
    IamPolicyOptimizer.getArgv = () => {
      return {
        _: [__dirname + "/../test/policy.json"]
      };
    };
    await IamPolicyOptimizer.commandLine();
    this.comparePolicies(this.getSampleOptimizedPolicy(), result.trim());
  }

  @test
  async commandLineFileNotFound() {
    const original = console.log;
    let result = "";
    console.log = (...args) => {
      args.forEach(arg => (result += arg.toString()));
    };
    IamPolicyOptimizer.getArgv = () => {
      return {
        _: [__dirname + "/../test/policy.nope.json"]
      };
    };
    await IamPolicyOptimizer.commandLine();
    assert.equal(result.endsWith("test/policy.nope.json was not found"), true);
  }

  @test
  async commandLineEmpty() {
    const original = console.log;
    let result = "";
    console.log = (...args) => {
      args.forEach(arg => (result += arg.toString()));
    };
    IamPolicyOptimizer.getArgv = () => {
      return {
        _: []
      };
    };
    await IamPolicyOptimizer.commandLine();
    assert.equal(
      result,
      "iam-policy-generator must use either --arn or a file argument"
    );
  }

  @test
  async getArgv() {
    IamPolicyOptimizer.getArgv = GetArgv;
    process.argv = [
      "node",
      "iam-policy-optimizer",
      "--arn",
      "testor",
      "--save"
    ];
    let info = IamPolicyOptimizer.getArgv();
    assert.equal(info.save, true);
    assert.equal(info.arn, "testor");
  }

  @test
  async iamPolicy() {
    const original = console.log;
    IamPolicyOptimizer.IAMEndpoint = "http://localhost:4566";
    process.env.AWS_DEFAULT_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "localstack";
    process.env.AWS_SECRET_ACCESS_KEY = "localstack";
    let iam = new AWS.IAM({
      endpoint: IamPolicyOptimizer.IAMEndpoint,
      region: "us-east-1"
    });
    try {
      await this.cleanPolicy(iam);
      let {
        Policy: { Arn }
      } = await iam
        .createPolicy({
          PolicyDocument: this.getSamplePolicy(),
          PolicyName: "TestPolicy"
        })
        .promise();
      IamPolicyOptimizer.getArgv = () => {
        return {
          arn: Arn
        };
      };
      let result = "";
      console.log = (...args) => {
        args.forEach(arg => (result += arg.toString()));
      };
      await IamPolicyOptimizer.commandLine();
      this.comparePolicies(this.getSampleOptimizedPolicy(), result.trim());
      let version = (await iam.getPolicy({ PolicyArn: Arn }).promise()).Policy
        .DefaultVersionId;
      assert.equal(version, "v1");
      IamPolicyOptimizer.getArgv = () => {
        return {
          arn: Arn,
          save: true
        };
      };
      await IamPolicyOptimizer.commandLine();
      version = (await iam.getPolicy({ PolicyArn: Arn }).promise()).Policy
        .DefaultVersionId;
      assert.equal(version, "v2");
      await IamPolicyOptimizer.commandLine();
      version = (await iam.getPolicy({ PolicyArn: Arn }).promise()).Policy
        .DefaultVersionId;
      assert.equal(
        version,
        "v2",
        "Version should not change as it is the same"
      );
    } finally {
      // Clean policy
      await this.cleanPolicy(iam);
    }
  }
}
