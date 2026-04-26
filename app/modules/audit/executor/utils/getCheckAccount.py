import logging
import subprocess

from pypsexec.client import Client

from app.modules.audit.schemas import Audit


def get_guest_account(policy_name):
    command = "net user guest"
    output = subprocess.check_output(command, shell=True).decode()
    output_lines = output.split("\n")

    for line in output_lines:
        if policy_name in line:
            return line.strip().split()[-1]


def get_admin_account(policy_name):
    command = "net user administrator"
    output = subprocess.check_output(command, shell=True).decode()
    output_lines = output.split("\n")

    for line in output_lines:
        if policy_name in line:
            return line.strip().split()[-1]


def get_value():
    try:
        win_client = Client("", username="", password="")
        win_client.connect()
        win_client.create_service()

        arg = "net user guest"

        stdout, stderr, rc = win_client.run_executable("powershell.exe", arguments=arg)

        output = stdout.decode("utf-8").split("\r\n")

        print(f"Output:\n{output}")
    finally:
        try:
            win_client.remove_service()
        except Exception:
            pass
        try:
            win_client.disconnect()
        except Exception:
            pass


def get_check_account_actual_value(win_client: Client, audit: Audit):
    try:
        # get check account value
        stdout, stderr, rc = win_client.run_executable(
            "powershell.exe", arguments=audit.check_data
        )
        output = stdout.decode("utf-8").replace("\r\n", "")
        return output.split()[-1].strip()
    except Exception as e:
        logging.error(f"error remote machine: {str(e)}")
        return ""


def compare_check_account(audit: Audit, stdout):

    # user rights
    # df = data_dict["CHECK_ACCOUNT"]
    # checklist_values = df["Checklist"].values
    # idx_values = df["Index"].values
    # value_data_values = df["Value Data"].values
    # description_values = df["Description"].values
    value_data_values = audit.rule.value_data
    description_values = audit.rule.description

    # actual_value_list = actual_value_dict["CHECK_ACCOUNT"]

    pass_result = True

    # if val == 1

    description = str(description_values)
    expected_value = str(value_data_values).lower()
    actual_value = stdout.lower()

    if (
        "Rename administrator account" in description
        or "Rename guest account" in description
    ) and expected_value == actual_value:
        pass_result = False
    elif expected_value != actual_value:
        pass_result = False
    else:
        pass_result = True

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
    audit.pass_result = pass_result

    # else:
    #     actual_value_list.append("")
    #     result_lists.append("")

    # col_name1 = ip_addr + " | Actual Value"
    # col_name2 = ip_addr + " | Result"

    # df[col_name1] = actual_value_list
    # df[col_name2] = result_lists

    # # data_dict["CHECK_ACCOUNT"] = df
    # return df


def compare_check_account_local(audit: Audit):

    # user rights
    # df = data_dict["CHECK_ACCOUNT"]
    # checklist_values = df["Checklist"].values
    # idx_values = df["Index"].values
    value_data_values = audit.rule.value_data
    description_values = audit.rule.description
    actual_value_list = audit.actual_value

    # result_lists = []

    pass_result = True

    # if val == 1

    description = str(description_values)
    expected_value = str(value_data_values).lower()
    actual_value = actual_value_list.split()[-1].strip().lower()

    if (
        "Rename administrator account" in description
        or "Rename guest account" in description
    ) and expected_value == actual_value:
        pass_result = False
    elif expected_value != actual_value:
        pass_result = False
    else:
        pass_result = True
    audit.passed = pass_result

    # if pass_result:
    #     print(
    #         f"{idx_values[idx]}: PASSED | Expected: {expected_value} | Actual: {actual_value}"
    #     )
    #     result_lists.append("PASSED")
    # else:
    #     print(
    #         f"{idx_values[idx]}: FAILED | Expected: {expected_value} | Actual: {actual_value}"
    #     )
    #     result_lists.append("FAILED")

    # else:
    #     actual_value_list.append("")
    #     result_lists.append("")

    # col_name1 = "ip_addr" + " | Actual Value"
    # col_name2 = "ip_addr" + " | Result"

    # df = df.rename(columns={"Actual Value": col_name1})
    # df[col_name1] = actual_value_list
    # df[col_name2] = result_lists

    # # data_dict["CHECK_ACCOUNT"] = df
    # return df
