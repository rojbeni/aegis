import logging

from pypsexec.client import Client

from app.modules.audit.schemas import Audit


def get_anonymous_sid_value(win_client: Client, audit: Audit):
    try:
        # dump all pwd policies
        arg = r"if (!(Test-Path -Path C:\temp )) { New-Item -ItemType directory -Path C:\temp };secedit /export /cfg C:\temp\secpol.cfg /areas SECURITYPOLICY"
        win_client.run_executable("powershell.exe", arguments=arg)

        # get pwd policy value
        actual_values = ""
        stdout, stderr, rc = win_client.run_executable(
            "powershell.exe", arguments=audit.check_data
        )
        output = stdout.decode("utf-8").replace("\r\n", "")
        actual_values = actual_values + output

        actual_value_list = actual_values.split("====")
        actual_value_list.pop(0)
        return actual_value_list
    except Exception as e:
        logging.error(f"error remote machine: {str(e)}")
        return []


def compare_anonymous_sid(audit: Audit, actual_value_list):
    # anonymous sid setting
    # checklist_values = audit.rule.checklist
    # description_values = audit.rule.description
    # idx_values = audit.rule.index
    value_data_values = audit.rule.value_data

    # actual_value_list = actual_value_dict["ANONYMOUS_SID_SETTING"]
    # result_lists = []

    pass_result = True

    # if val == 1

    description = audit.rule.description
    expected_value = str(value_data_values).lower()

    actual_value = actual_value_list[0].split("=")[-1].strip()
    actual_value_list[0] = actual_value

    if "Allow anonymous SID/Name translation" in description:
        try:
            actual_value = int(actual_value)
            if actual_value == int(expected_value):
                pass_result = True
            else:
                pass_result = False
        except ValueError:
            print(f"Invalid value: {actual_value}")
            pass_result = False
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

    # # data_dict["ANONYMOUS_SID_SETTING"] = df
    # return df


def compare_anonymous_sid_local(data_dict):
    # anonymous sid setting
    df = data_dict["ANONYMOUS_SID_SETTING"]
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

        actual_value = actual_value_list[idx].split("=")[-1].strip()
        actual_value_list[idx] = actual_value

        if "Allow anonymous SID/Name translation" in description:
            try:
                actual_value = int(actual_value)
                if actual_value == int(expected_value):
                    pass_result = True
                else:
                    pass_result = False
            except ValueError:
                print(f"Invalid value: {actual_value}")
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

    # data_dict["ANONYMOUS_SID_SETTING"] = df
    return df
