import { suite, test } from "mocha-typescript";
import IamPolicyOptimizer from "./index";
import * as fs from "fs";
import * as assert from "assert";

@suite
class IamPolicyOptimizerTest {
  @test
  complexScenario() {
    let policy = fs.readFileSync(__dirname + "/../test/policy.json").toString();
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
}
