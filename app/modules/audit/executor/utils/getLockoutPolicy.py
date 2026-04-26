import logging
import subprocess

from pypsexec.client import Client

from app.modules.audit.schemas import Audit


def get_lockout_policy(policy_name):
    command = "net accounts"
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

        arg = "net accounts"

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
        # return result
        # return result

    args_list = ["Lockout duration", "Lockout threshold"]
    actual_value_list = []
    for arg in args_list:
        for out in output:
            if arg in out:
                actual_value_list.append(out.split()[-1].strip())

    print(actual_value_list)


def get_lockout_policy_actual_value(win_client: Client, audit: Audit):
    try:
        stdout, stderr, rc = win_client.run_executable(
            "powershell.exe", arguments=audit.check_data
        )
        return stdout.decode("utf-8").replace("\r\n", "")
    except Exception as e:
        logging.error(f"error remote machine: {str(e)}")
        return ""


def compare_lockout_policy(audit: Audit, stdout: str):
    # password policy
    # df = data_dict["LOCKOUT_POLICY"]
    # checklist_values = df["Checklist"].values
    # description_values = df["Description"].values
    # idx_values = df["Index"].values
    # value_data_values = df["Value Data"].values

    # value_data_values = audit.rule.value_data
    description = audit.rule.description
    # reg_option = audit.rule.reg_option

    pass_result = True

    expected_value = str(audit.rule.value_data).lower()
    actual_value = stdout

    if "Account lockout duration" in description:
        try:
            actual_value = int(actual_value)
            vals = expected_value.strip("[]").split("..")
            min_val = vals[0]

            if int(actual_value) >= int(min_val):
                pass_result = True
            else:
                pass_result = False

        except ValueError:
            pass_result = False
    elif "Account lockout threshold" in description:
        if actual_value == "Never":
            pass_result = False
        else:
            try:
                actual_value = int(actual_value)
                vals = expected_value.strip("[]").split("..")
                min_val = vals[0]
                max_val = vals[1]

                if int(actual_value) >= int(min_val) and int(actual_value) <= int(
                    max_val
                ):
                    pass_result = True
                else:
                    pass_result = False

            except ValueError:
                pass_result = False
    elif "Reset account lockout counter" in description:
        try:
            actual_value = int(actual_value)
            vals = expected_value.strip("[]").split("..")
            min_val = vals[0]
            max_val = vals[1]

            if int(actual_value) >= int(min_val):
                pass_result = True
            else:
                pass_result = False

        except ValueError:
            pass_result = False
    else:
        pass_result = False
    audit.passed = pass_result

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

    # # else:
    # #     actual_value_list.append("")
    # #     result_lists.append("")

    # col_name1 = ip_addr + " | Actual Value"
    # col_name2 = ip_addr + " | Result"

    # df[col_name1] = actual_value_list
    # df[col_name2] = result_lists

    # # data_dict["LOCKOUT_POLICY"] = df
    # return df


def compare_lockout_policy_local(data_dict):
    # password policy
    df = data_dict["LOCKOUT_POLICY"]
    checklist_values = df["Checklist"].values
    description_values = df["Description"].values
    idx_values = df["Index"].values
    value_data_values = df["Value Data"].values
    actual_value_list = df["Actual Value"].values

    result_lists = []

    for idx, val in enumerate(checklist_values):
        pass_result = True

        # if val == 1

        description = description_values[idx]
        expected_value = str(value_data_values[idx]).lower()
        actual_value = actual_value_list[idx].split()[-1].strip()
        actual_value_list[idx] = actual_value

        if actual_value == "Null":
            pass_result = False

        elif "Account lockout duration" in description:
            try:
                actual_value = int(actual_value)
                vals = expected_value.strip("[]").split("..")
                min_val = vals[0]

                if int(actual_value) >= int(min_val):
                    pass_result = True
                else:
                    pass_result = False

            except ValueError:
                pass_result = False
        elif "Account lockout threshold" in description:
            if actual_value == "Never":
                pass_result = False
            else:
                try:
                    actual_value = int(actual_value)
                    vals = expected_value.strip("[]").split("..")
                    min_val = vals[0]
                    max_val = vals[1]

                    if int(actual_value) >= int(min_val) and int(actual_value) <= int(
                        max_val
                    ):
                        pass_result = True
                    else:
                        pass_result = False

                except ValueError:
                    pass_result = False
        elif "Reset account lockout counter" in description:
            try:
                actual_value = int(actual_value)
                vals = expected_value.strip("[]").split("..")
                min_val = vals[0]
                max_val = vals[1]

                if int(actual_value) >= int(min_val):
                    pass_result = True
                else:
                    pass_result = False

            except ValueError:
                pass_result = False
        else:
            pass_result = False

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

    # data_dict["LOCKOUT_POLICY"] = df
    return df
