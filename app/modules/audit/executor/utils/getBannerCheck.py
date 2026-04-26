import logging

from pypsexec.client import Client

from app.modules.audit.schemas import Audit


def get_banner_check_actual_value(win_client: Client, audit: Audit):
    try:
        actual_values = ""
        stdout, stderr, rc = win_client.run_executable(
            "powershell.exe", arguments=audit.check_data
        )
        output = stdout.decode("utf-8").replace("\r\n", "").replace("\x00", "")
        actual_values = actual_values + output

        actual_value_list = actual_values.split("====")
        if actual_value_list and actual_value_list[0] == "":
            actual_value_list.pop(0)
        return actual_value_list
    except Exception as e:
        logging.error(f"error remote machine: {str(e)}")
        return []


def compare_banner_check(audit: Audit, actual_value_list):
    # banner check
    # checklist_values = df["Checklist"].values
    # idx_values = df["Index"].values
    # value_data_values = df["Value Data"].values

    # value_data_values = audit.rule.value_data

    # actual_value_list = actual_value_dict["BANNER_CHECK"]
    # result_lists = []

    pass_result = True

    # if val == 1

    # expected_value = str(value_data_values[idx]).lower()
    # actual_value = actual_value_list[idx]

    # if actual_value == "":
    #     pass_result = False
    # else:
    #     pass_result = True

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

    # # data_dict["BANNER_CHECK"] = df
    # return df


def compare_banner_check_local(data_dict):
    logging.info("comparing banner check")
    # banner check
    # df = data_dict["BANNER_CHECK"]
    # checklist_values = df["Checklist"].values
    # idx_values = df["Index"].values
    # value_data_values = df["Value Data"].values
    # actual_value_list = df["Actual Value"].values

    # result_lists = []

    # for idx, val in enumerate(checklist_values):
    #     pass_result = True

    #     # if val == 1

    #     expected_value = str(value_data_values[idx]).lower()
    #     actual_value = actual_value_list[idx].strip()
    #     actual_value_list[idx] = actual_value

    #     if actual_value == "" or actual_value.isprintable() == False:
    #         pass_result = False
    #     else:
    #         pass_result = True

    #     if pass_result:
    #         print(
    #             f"{idx_values[idx]}: PASSED | Expected: {expected_value} | Actual: {actual_value}"
    #         )
    #         result_lists.append("PASSED")
    #     else:
    #         print(
    #             f"{idx_values[idx]}: FAILED | Expected: {expected_value} | Actual: {actual_value}"
    #         )
    #         result_lists.append("FAILED")

    # col_name1 = "ip_addr" + " | Actual Value"
    # col_name2 = "ip_addr" + " | Result"

    # df = df.rename(columns={"Actual Value": col_name1})
    # df[col_name1] = actual_value_list
    # df[col_name2] = result_lists

    # # data_dict["BANNER_CHECK"] = df
    # return df
