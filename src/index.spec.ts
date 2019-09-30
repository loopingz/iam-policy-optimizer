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
}
