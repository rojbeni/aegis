import re

from bs4 import BeautifulSoup

from app.core.database import engine
from app.modules.benchmark import models, schemas

# Initialize DB tables just in case
models.Base.metadata.create_all(bind=engine)

# The regular expressions to extract required data
regexes = {
    "type": re.compile(r"type\s+:\s+(.*?)\n"),
    "description": re.compile(r"description\s+:\s+(.*?)\n"),
    "value_data": re.compile(r"value_data\s+:\s+(.*?)\n"),
    "reg_key": re.compile(r"reg_key\s+:\s+(.*?)\n"),
    "reg_item": re.compile(r"reg_item\s+:\s+(.*?)\n"),
    "reg_option": re.compile(r"reg_option\s+:\s+(.*?)\n"),
    "audit_policy_subcategory": re.compile(r"audit_policy_subcategory\s+:\s+(.*?)\n"),
    "key_item": re.compile(r"key_item\s+:\s+(.*?)\n"),
    "right_type": re.compile(r"right_type\s+:\s+(.*?)\n"),
    "solution": re.compile(
        r"solution\s*:\s*(.+?)\n\s*reference", re.DOTALL | re.IGNORECASE
    ),
}


def read_file(filename: str) -> str:
    contents = ""
    try:
        with open(filename, "r") as file_in:
            contents = file_in.read()
    except Exception as e:
        print(f"error: reading file: {filename}: {e}")
    return contents


def parse_audit_elements(
    audit: str,
) -> tuple[schemas.BenchmarkCreate, list[schemas.RuleCreate]]:
    clean_audit = re.sub(r"^#\s*(<)", r"\1", audit, flags=re.MULTILINE)
    soup = BeautifulSoup(clean_audit, "lxml")

    display_name_tag = soup.find("display_name")
    version_tag = soup.find("version")
    link_tag = soup.find("link")
    name_tag = soup.find("name")
    profile_tag = soup.find("profile")
    labels_tag = soup.find("labels")
    benchmark_refs_tag = soup.find("benchmark_refs")

    title = display_name_tag.text.strip() if display_name_tag else "Unknown Benchmark"
    version = version_tag.text.strip() if version_tag else "1.0.0"
    description = link_tag.text.strip() if link_tag else "Parsed from audit file"
    name = name_tag.text.strip() if name_tag else None
    profile = profile_tag.text.strip() if profile_tag else None
    labels_text = labels_tag.text.strip() if labels_tag else None
    labels = [lbl.strip() for lbl in labels_text.split(",")] if labels_text else None

    benchmark_refs_text = (
        benchmark_refs_tag.text.strip() if benchmark_refs_tag else None
    )
    benchmark_refs = (
        [ref.strip() for ref in benchmark_refs_text.split(",")]
        if benchmark_refs_text
        else None
    )

    benchmark_info = schemas.BenchmarkCreate(
        title=title,
        version=version,
        description=description,
        name=name,
        profile=profile,
        labels=labels,
        benchmark_refs=benchmark_refs,
    )

    items = soup.find_all("custom_item")
    variables = soup.find_all("variable")

    parsed_rules = []

    var_dict = {}
    for var in variables:
        name_tag = var.find("name")
        default_tag = var.find("default")
        if name_tag and default_tag:
            var_dict[f"@{name_tag.text.strip()}@"] = default_tag.text.strip()

    for item in items:
        item_str = str(item)

        type_match = regexes["type"].search(item_str)
        type_val = type_match.group(1).strip() if type_match else None

        if type_val == "AUDIT_POWERSHELL":
            continue

        desc_match = regexes["description"].search(item_str)
        description = desc_match.group(1).replace('"', "") if desc_match else None
        index_val = None
        if description and description[0].isdigit():
            index_match = re.search(r"(.*?)\s", description)
            if index_match:
                index_val = index_match.group(1)
                description = description.replace(index_val, "").strip()

        if index_val is not None:
            index_val = str(index_val).strip()

        sol_match = regexes["solution"].search(item_str)
        solution = (
            sol_match.group(1).strip('"').replace("\n", " ") if sol_match else None
        )

        val_match = regexes["value_data"].search(item_str)
        value_data = (
            val_match.group(1).replace('"', "").replace("&amp;&amp;", "&&")
            if val_match
            else None
        )

        if value_data:
            for v_name, v_default in var_dict.items():
                if v_name in value_data:
                    value_data = value_data.replace(v_name, v_default)

        reg_key_match = regexes["reg_key"].search(item_str)
        reg_key = reg_key_match.group(1).replace('"', "") if reg_key_match else None

        reg_item_match = regexes["reg_item"].search(item_str)
        reg_item = reg_item_match.group(1).replace('"', "") if reg_item_match else None

        reg_opt_match = regexes["reg_option"].search(item_str)
        reg_option = reg_opt_match.group(1).replace('"', "") if reg_opt_match else None

        key_item_match = regexes["key_item"].search(item_str)
        key_item = key_item_match.group(1) if key_item_match else None

        if key_item:
            reg_item = key_item.replace('"', "")

        ap_sub_match = regexes["audit_policy_subcategory"].search(item_str)
        audit_policy_subcategory = (
            ap_sub_match.group(1).replace('"', "") if ap_sub_match else None
        )

        rt_match = regexes["right_type"].search(item_str)
        right_type = rt_match.group(1).replace('"', "") if rt_match else None

        # Clean the data
        if type_val == "BANNER_CHECK":
            value_data = ""
        elif type_val == "ANONYMOUS_SID_SETTING":
            value_data = "0"
        elif type_val == "REG_CHECK":
            reg_key = value_data
            value_data = ""
        elif type_val == "CHECK_ACCOUNT":
            if description and "Rename administrator account" in description:
                value_data = "Administrator"
            elif description and "Disabled" in description:
                value_data = "No"
        elif type_val == "PASSWORD_POLICY":
            if value_data == "Enabled":
                value_data = "1"
            elif value_data == "Disabled":
                value_data = "0"
            elif value_data == "@PASSWORD_HISTORY@":
                value_data = "24"
            elif value_data == "@MAXIMUM_PASSWORD_AGE@":
                value_data = "365"
            elif value_data == "@MINIMUM_PASSWORD_AGE@":
                value_data = "1"
            elif value_data == "@MINIMUM_PASSWORD_LENGTH@":
                value_data = "14"
        elif type_val == "REGISTRY_SETTING":
            if index_val == "0":
                value_data = "Windows"
            elif description and "Lock Workstation" in description:
                value_data = "1 || 2 || 3"
            elif description and "None" in description:
                value_data = "Null"
            elif (
                description
                and " Remotely accessible registry paths" in description
                and value_data
            ):
                value_data = value_data.replace(" && ", "")
            elif description and "Screen saver timeout" in description:
                value_data = "[0..900]"

        rule = schemas.RuleCreate(
            type=type_val,
            index=index_val,
            description=description,
            solution=solution,
            reg_key=reg_key,
            reg_item=reg_item,
            reg_option=reg_option,
            audit_policy_subcategory=audit_policy_subcategory,
            right_type=right_type,
            value_data=str(value_data) if value_data is not None else None,
        )
        parsed_rules.append(rule)

    return benchmark_info, parsed_rules


def parse(
    filename: str,
) -> tuple[schemas.BenchmarkCreate, list[schemas.RuleCreate]] | None:
    audit_content = read_file(filename=filename)
    if audit_content:
        return parse_audit_elements(audit_content)
    return None


# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Parse audit file and save to DB.")
#     parser.add_argument(
#         "-audit", type=str, required=True, help="Path to raw audit file (.audit)"
#     )

#     args = parser.parse_args()

#     print(f"Parsing audit file: {args.audit}")

#     audit_content = read_file(args.audit)
#     if audit_content:
#         rules = parse_audit_elements(audit_content)
#         save_to_db(args.audit, rules)
