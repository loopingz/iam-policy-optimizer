export default class IamPolicyOptimizer {
  static POLICY_LIMIT = 6144;
  static reduce(policy: string): string {
    return JSON.stringify(this.reducePolicyObject(JSON.parse(policy)));
  }

  static optimizeResource(arg: string[]) {
    // First remove any duplicate
    let res = [...new Set(arg)];
    let toRemove = [];
    res.forEach(p => {
      if (!p.endsWith("*")) return;
      let rep = p.substr(0, p.length - 2);
      res.forEach(m => {
        if (m === p) return;
        if (m.startsWith(rep)) {
          toRemove.push(m);
        }
      });
    });
    return res.filter(p => toRemove.indexOf(p) < 0);
  }

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
        commands[Effect][action] = IamPolicyOptimizer.optimizeResource(
          commands[Effect][action]
        );
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
        newPolicy.Statement.push({
          Sid: (sids++).toString(36),
          Effect,
          Action: newMap[i],
          Resource: i
        });
      }
    });

    if (JSON.stringify(newPolicy).length > IamPolicyOptimizer.POLICY_LIMIT) {
      console.error(
        "Reduced policy is still too big",
        JSON.stringify(newPolicy).length
      );
    }

    return newPolicy;
  }
}
