export interface NodeDatum {
  legitimate_dmarc_fail: number;
  auth_fail_messages: number;
  legitimate_messages: number;
  legitimate_policy_applied: number;
  suspicious_messages: number;
  total_messages: number;
  DMARC_pass_ratio: number;
  double_pass_ratio: number;
  policy: string;
  domain: string;
  domain_use: string;
  abuse_ratio: number;
  client_name: string;
}
