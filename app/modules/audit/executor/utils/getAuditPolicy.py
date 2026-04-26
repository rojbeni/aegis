import logging
import subprocess

from pypsexec.client import Client

from app.modules.audit.schemas import Audit


def get_audit_policy(subcategory):
    cmd = f'auditpol /get /subcategory:"{subcategory}"'
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    output = result.stdout
    print(f"result is {output}")

    line = output.split("\n")[4]
    result = line.replace(subcategory, "").strip()
    return result


def get_audit_policy_actual_value(win_client: Client, audit: Audit):
    try:
        # get audit policy value
        stdout, stderr, rc = win_client.run_executable(
            "powershell.exe", arguments=audit.check_data
        )
        return stdout.decode("utf-8").replace("\r\n", "")
    except Exception as e:
        logging.error(f"error remote machine: {str(e)}")
        return ""


def compare_audit_policy(audit: Audit, stdout: str):

    # audit policy
    # checklist_values = audit.rule.checklist
    # idx_values = audit.rule.index
    value_data_values = audit.rule.value_data

    # actual_value_list = actual_value_dict["AUDIT_POLICY_SUBCATEGORY"]
    # result_lists = []

    pass_result = True

    # if val == 1

    expected_value = str(value_data_values).lower()
    actual_value = stdout

    pass_result = compare_audit_result(actual_value, expected_value)
    audit.pass_result = pass_result

    # if pass_result:
    #     print(
    #         f"{ip_addr} | {idx_values[idx]}: PASSED | Expected: {expected_value} | Actual: {actual_value}"
    #     )
    #     result_lists.append("PASSED")
    # else:
    #     print(
    #         f"{ip_addr} | {idx_values[idx]}: FAILED | Expected: {expected_value} | Actual: {actual_value}"
    #     )
    #     result_lists.append("FAILED")

    # else:
    #     actual_value_list.append("")
    #     result_lists.append("")

    # col_name1 = ip_addr + " | Actual Value"
    # col_name2 = ip_addr + " | Result"

    # df[col_name1] = actual_value_list
    # df[col_name2] = result_lists

    # # data_dict["AUDIT_POLICY_SUBCATEGORY"] = df
    # return df


def compare_audit_result(actual_value, expected_value):

    result_dict = {
        "Success and Failure": "Success, Failure",
        "Success": "Success",
        "Failure": "Failure",
        "No Auditing": "No Auditing",
    }

    if "||" in expected_value:
        expected_list = expected_value.split("||")
        for i in expected_list:
            i = i.strip()
            if result_dict[actual_value].lower() == i.lower():
                return True

    elif result_dict[actual_value].lower() == expected_value.lower():
        return True

    return False


def compare_audit_policy_local(data_dict):

    # audit policy
    df = data_dict["AUDIT_POLICY_SUBCATEGORY"]
    checklist_values = df["Checklist"].values
    idx_values = df["Index"].values
    value_data_values = df["Value Data"].values
    actual_value_list = df["Actual Value"].values

    result_lists = []

    for idx, val in enumerate(checklist_values):
        pass_result = True

        # if val == 1

        expected_value = str(value_data_values[idx]).lower()
        actual_value = actual_value_list[idx].strip()

        actual_value = actual_value.split("  ")[-1].strip()

        actual_value_list[idx] = actual_value

        pass_result = compare_audit_result(actual_value, expected_value)

        if pass_result:
            print(
                f"{idx_values[idx]}: PASSED | Expected: {expected_value} | Actual: {actual_value}"
            )
            result_lists.append("PASSED")
        else:
            print(
                f"{idx_values[idx]}: FAILED | Expected: {expected_value} | Actual: {actual_value}"
            )
            result_lists.append("FAILED")

        # else:
        #     actual_value_list.append("")
        #     result_lists.append("")

    col_name1 = "ip_addr" + " | Actual Value"
    col_name2 = "ip_addr" + " | Result"

    df = df.rename(columns={"Actual Value": col_name1})
    df[col_name1] = actual_value_list
    df[col_name2] = result_lists

    # data_dict["AUDIT_POLICY_SUBCATEGORY"] = df
    return df
