require("dotenv").config();
module.exports = {
  elastic: {
    host: "13.250.110.230:9200",
  },
  aws_remote_config: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "",
  },
  athena: {
    region: process.env.AWS_ATHENA_REGION || "",
    s3Location: "s3://aws-athena-query-results-615547149551-us-east-1",
    db: "ns_data",
    tables: [
      "ns_audio",
      "ns_document",
      "ns_facebook",
      "ns_facebook_comments",
      "ns_image",
      "ns_instagram",
      "ns_reddit",
      "ns_reddit_stream",
      "ns_twitter",
      "ns_twitter_stream",
      "ns_video",
      "ns_webhose",
      "ns_youtube",
    ],
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    createBucketIfNotPresent: true,
  },
};
