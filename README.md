# IAM Policy Optimizer

[![codecov](https://codecov.io/gh/loopingz/iam-policy-optimizer/branch/master/graph/badge.svg?token=INUZQNLM53)](https://codecov.io/gh/loopingz/iam-policy-optimizer)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=iam-policy-optimizer&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=iam-policy-optimizer)
[![CI](https://github.com/loopingz/iam-policy-optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/loopingz/iam-policy-optimizer/actions/workflows/ci.yml)
[![CodeQL](https://github.com/loopingz/iam-policy-optimizer/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/loopingz/iam-policy-optimizer/actions/workflows/codeql-analysis.yml)

As AWS IAM Policy are limit in size to 6,144 characters (https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html) the optimizer is trying to reduce to the minimal amount of characters any policy

## Usage

Display the optimized policy

```shell
npx iam-policy-optimizer --arn policyArn
```

### Get policy from

File:

```shell
npx iam-policy-optimizer file.json
```

Stdin:

```shell
npx iam-policy-optimizer -
```

AWS:

```shell
npx iam-policy-optimizer --arn --save
```

The option --save will auto-save in AWS if the new version is optimizable

## Example

The policy (3517 characters is reduced to 1407 characters)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "11",
      "Effect": "Allow",
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:GetObjectTagging",
        "s3:GetObjectTorrent",
        "s3:GetObjectVersion",
        "s3:GetObjectVersionAcl",
        "s3:GetObjectVersionTagging",
        "s3:GetObjectVersionTorrent",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListBucketVersions",
        "s3:ListMultipartUploadParts",
        "s3:PutBucketAcl",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:RestoreObject"
      ],
      "Resource": "*"
    },
    {
      "Sid": "123",
      "Effect": "Allow",
      "Action": ["logs:DescribeLogGroups"],
      "Resource": ["arn:aws:logs:us-east-1:666:*"]
    },
    {
      "Sid": "222",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/dev-table1"]
    },
    {
      "Sid": "we",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/dev-table2"]
    },
    {
      "Sid": "33",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/dev-cves-status"]
    },
    {
      "Sid": "queue",
      "Effect": "Allow",
      "Action": [
        "sqs:DeleteMessage",
        "sqs:DeleteMessageBatch",
        "sqs:ReceiveMessage",
        "sqs:SendMessage",
        "sqs:SendMessageBatch"
      ],
      "Resource": ["arn:aws:sqs:us-east-1:666:dev-nxsec-tasks-queue"]
    },
    {
      "Sid": "table3",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/dev-table3"]
    },
    {
      "Sid": "table4",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/table4"]
    },
    {
      "Sid": "table-wildcard",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:666:table/dev-table*"]
    },
    {
      "Sid": "assumeRole",
      "Effect": "Allow",
      "Action": ["sts:AssumeRole"],
      "Resource": ["arn:aws:iam::*:role/my-role"]
    },
    {
      "Sid": "s31",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::mybucket/scans/*"]
    },
    {
      "Sid": "ListReports",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::mybucket"]
    },
    {
      "Sid": "s32",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::mybucket/computers/*"]
    },
    {
      "Sid": "mybucket2",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::mybucket2/inventories/*",
        "arn:aws:s3:::mybucket2/costs/*"
      ]
    },
    {
      "Sid": "WebdaLog",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": ["arn:aws:logs:us-east-1:666:*"]
    }
  ]
}
```

is transformed to

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "1",
      "Effect": "Allow",
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:GetObjectTagging",
        "s3:GetObjectTorrent",
        "s3:GetObjectVersion",
        "s3:GetObjectVersionAcl",
        "s3:GetObjectVersionTagging",
        "s3:GetObjectVersionTorrent",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListBucketVersions",
        "s3:ListMultipartUploadParts",
        "s3:PutBucketAcl",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:RestoreObject"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "2",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:666:*"
      ]
    },
    {
      "Sid": "3",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:666:table/dev-cves-status",
        "arn:aws:dynamodb:us-east-1:666:table/dev-table*",
        "arn:aws:dynamodb:us-east-1:666:table/table4"
      ]
    },
    {
      "Sid": "4",
      "Effect": "Allow",
      "Action": [
        "sqs:DeleteMessage",
        "sqs:DeleteMessageBatch",
        "sqs:ReceiveMessage",
        "sqs:SendMessage",
        "sqs:SendMessageBatch"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-1:666:dev-nxsec-tasks-queue"
      ]
    },
    {
      "Sid": "5",
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/my-role"
      ]
    }
  ]
}
```
