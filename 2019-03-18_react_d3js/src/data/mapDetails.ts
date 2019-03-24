export const mapDetails = (d: any) => {
  return {
    legitimate_dmarc_fail: +d.legitimate_dmarc_fail,
    auth_fail_messages: +d.auth_fail_messages,
    legitimate_messages: +d.legitimate_messages,
    legitimate_policy_applied: +d.legitimate_policy_applied,
    suspicious_messages: +d.suspicious_messages,
    total_messages: +d.total_messages,
    DMARC_pass_ratio: +d.DMARC_pass_ratio,
    double_pass_ratio: +d.double_pass_ratio,
    policy: d.policy,
    domain: d.domain,
    domain_use: d.domain_use,
    abuse_ratio:
      +d.total_messages > 0 ? +d.suspicious_messages / +d.total_messages : 0,
    client_name: d.account_name
  };
};
