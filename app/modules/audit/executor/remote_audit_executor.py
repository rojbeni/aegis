import logging

from pypsexec.client import Client

from app.modules.asset.schemas import Asset
from app.modules.audit.executor.utils.getAnonySID import (
    compare_anonymous_sid,
    get_anonymous_sid_value,
)
from app.modules.audit.executor.utils.getAuditPolicy import (
    compare_audit_policy,
    get_audit_policy_actual_value,
)
from app.modules.audit.executor.utils.getBannerCheck import (
    compare_banner_check,
    get_banner_check_actual_value,
)
from app.modules.audit.executor.utils.getCheckAccount import (
    compare_check_account,
    get_check_account_actual_value,
)
from app.modules.audit.executor.utils.getLockoutPolicy import (
    compare_lockout_policy,
    get_lockout_policy_actual_value,
)
from app.modules.audit.executor.utils.getPwdPolicy import (
    compare_pwd_policy,
    get_pwd_policy_actual_value,
)
from app.modules.audit.executor.utils.getRegCheck import (
    compare_reg_check,
    get_reg_check_actual_value,
)
from app.modules.audit.executor.utils.getRegValue import (
    compare_reg_value,
    get_registry_actual_value,
)
from app.modules.audit.executor.utils.getUserRights import (
    compare_user_rights,
    get_user_rights_actual_value,
)
from app.modules.audit.executor.utils.getWMIPolicy import (
    compare_wmi_policy,
    get_wmi_policy_actual_value,
)
from app.modules.audit.models import AuditItem
from app.modules.audit.schemas import Audit
from app.modules.benchmark.schemas import Benchmark


def gen_ps_args(benchmark: Benchmark) -> list[Audit]:
    """
    This function generates a list of Audit objects containing the rule and its corresponding PowerShell check_data.

    :param benchmark: The Benchmark object containing a list of rules.
    :return: A list of Audit objects.
    """
    audits = []

    for rule in benchmark.rules:
        key = rule.type
        check_data = ""
        if key in ("REGISTRY_SETTING", "REG_CHECK", "BANNER_CHECK"):
            reg_key = str(getattr(rule, "reg_key", ""))
            reg_item = str(getattr(rule, "reg_item", ""))
            if reg_key.startswith("HKLM"):
                reg_key = reg_key.replace("HKLM", "HKLM:")
            elif reg_key.startswith("HKU"):
                reg_key = reg_key.replace("HKU", "HKU:")
            check_data = f"Get-ItemPropertyValue -Path '{reg_key}' -Name '{reg_item}'"

        elif key == "PASSWORD_POLICY":
            description = str(getattr(rule, "description", ""))
            subcategory = ""
            if "Enforce password history" in description:
                subcategory = "PasswordHistorySize ="
            elif "Maximum password age" in description:
                subcategory = "MaximumPasswordAge ="
            elif "Minimum password age" in description:
                subcategory = "MinimumPasswordAge ="
            elif "Minimum password length" in description:
                subcategory = "MinimumPasswordLength ="
            elif "complexity requirements" in description:
                subcategory = "PasswordComplexity ="
            elif "reversible encryption" in description:
                subcategory = "ClearTextPassword ="
            elif "Administrator account lockout" in description:
                subcategory = ""
            elif "Force logoff when logon hours expire" in description:
                subcategory = "ForceLogoffWhenHourExpire ="
            elif "Enforce user logon restrictions" in description:
                subcategory = "TicketValidateClient ="
            elif "Maximum lifetime for service ticket" in description:
                subcategory = "MaxServiceAge ="
            elif "Maximum lifetime for user ticket" in description:
                subcategory = "MaxTicketAge ="
            elif "Maximum lifetime for user ticket renewal" in description:
                subcategory = "MaxRenewAge ="
            elif "Maximum tolerance for computer clock synchronization" in description:
                subcategory = "MaxClockSkew ="
            check_data = f"Get-Content -Path C:\\temp\\secpol.cfg | Select-String -Pattern '{subcategory}'"

        elif key == "LOCKOUT_POLICY":
            description = str(getattr(rule, "description", ""))
            if "Account lockout duration" in description:
                check_data = "net accounts | select-string -pattern 'Lockout duration'"
            elif "Account lockout threshold" in description:
                check_data = "net accounts | select-string -pattern 'Lockout threshold'"
            elif "Reset account lockout counter" in description:
                check_data = (
                    "net accounts | select-string -pattern 'Lockout observation window'"
                )
            else:
                check_data = ""

        elif key == "USER_RIGHTS_POLICY":
            right_type = str(getattr(rule, "right_type", ""))
            check_data = f"Get-Content -Path C:\\temp\\secpol.cfg | Select-String -Pattern '{right_type}'"

        elif key == "CHECK_ACCOUNT":
            description = str(getattr(rule, "description", ""))
            if "Guest account status" in description:
                check_data = "net user guest | select-string -pattern 'Account active'"
            elif "Administrator account status" in description:
                check_data = (
                    "net user administrator | select-string -pattern 'Account active'"
                )
            elif "Rename administrator account" in description:
                check_data = (
                    "net user administrator | select-string -pattern 'User name'"
                )
            elif "Rename guest account" in description:
                check_data = "net user guest | select-string -pattern 'User name'"
            else:
                check_data = ""

        elif key == "ANONYMOUS_SID_SETTING":
            description = str(getattr(rule, "description", ""))
            subcategory = (
                "LSAAnonymousNameLookup ="
                if "Allow anonymous SID/Name translation" in description
                else ""
            )
            check_data = f"Write-Output '===='; Get-Content -Path C:\\temp\\secpol.cfg | Select-String -Pattern '{subcategory}'"

        elif key == "AUDIT_POLICY_SUBCATEGORY":
            subcategory = str(getattr(rule, "audit_policy_subcategory", ""))
            check_data = f"auditpol /get /subcategory:'{subcategory}' | select-string -pattern '{subcategory}'"

        elif key == "WMI_POLICY":
            check_data = "(Get-WmiObject -Class Win32_ComputerSystem).DomainRole"

        audits.append(Audit(rule=rule, check_data=check_data))

    return audits


def get_actual_values(
    asset: Asset, audits: list[Audit], benchmark: Benchmark
) -> list[Audit]:
    username = "administrator"
    password = "admin"

    win_client = Client(asset.ip_address, username=username, password=password)
    try:
        win_client.connect()
        win_client.create_service()
        for audit in audits:
            try:
                logging.info(f"Running {audit.rule.type} on {asset.ip_address} ...")
                if audit.rule.type == "PASSWORD_POLICY":
                    stdout = get_pwd_policy_actual_value(win_client, audit)
                    compare_pwd_policy(audit, stdout)
                elif audit.rule.type == "REGISTRY_SETTING":
                    stdout = get_registry_actual_value(win_client, audit)
                    compare_reg_value(audit, stdout)
                elif audit.rule.type == "LOCKOUT_POLICY":
                    stdout = get_lockout_policy_actual_value(win_client, audit)
                    compare_lockout_policy(audit, stdout)
                elif audit.rule.type == "USER_RIGHTS_POLICY":
                    actual_value_list = get_user_rights_actual_value(win_client, audit)
                    compare_user_rights(audit, actual_value_list, {})
                elif audit.rule.type == "CHECK_ACCOUNT":
                    stdout = get_check_account_actual_value(win_client, audit)
                    compare_check_account(audit, stdout)
                elif audit.rule.type == "BANNER_CHECK":
                    actual_value_list = get_banner_check_actual_value(win_client, audit)
                    compare_banner_check(audit, actual_value_list)
                elif audit.rule.type == "ANONYMOUS_SID_SETTING":
                    actual_value_list = get_anonymous_sid_value(win_client, audit)
                    compare_anonymous_sid(audit, actual_value_list)
                elif audit.rule.type == "AUDIT_POLICY_SUBCATEGORY":
                    stdout = get_audit_policy_actual_value(win_client, audit)
                    compare_audit_policy(audit, stdout)
                elif audit.rule.type == "REG_CHECK":
                    actual_value_list = get_reg_check_actual_value(win_client, audit)
                    compare_reg_check(audit, actual_value_list)
                elif audit.rule.type == "WMI_POLICY":
                    stdout = get_wmi_policy_actual_value(win_client, audit)
                    compare_wmi_policy(audit, stdout)
            except Exception as e:
                logging.error("Failed to execute rule %s: %s", audit.rule.id, e)
            logging.info(f"audit result: {audit.passed}")

    except Exception as e:
        logging.error(f"Failed to connect to {asset.ip_address}")
        raise e
    finally:
        try:
            win_client.remove_service()
        except Exception:
            pass
        try:
            win_client.disconnect()
        except Exception:
            pass


def execute(benchmark: Benchmark, asset: Asset) -> list[AuditItem]:
    audits = gen_ps_args(benchmark)
    get_actual_values(asset, audits, benchmark)
    audit_items = []
    for audit in audits:
        item = AuditItem(
            rule_id=audit.rule.id,
            passed=audit.passed,
            actual_value=(
                str(audit.actual_value)[:500]
                if audit.actual_value is not None
                else None
            ),
        )
        audit_items.append(item)

    return audit_items
