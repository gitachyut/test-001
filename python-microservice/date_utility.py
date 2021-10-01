from datetime import datetime
import dateparser
import re
from typing import Optional

month = (
    r"Jan(?:uary)?|"
    r"Feb(?:ruary)?|"
    r"Mar(?:ch)?|"
    r"Apr(?:il)?|"
    r"May|"
    r"Jun(?:e)?|"
    r"Jul(?:y)?|"
    r"Aug(?:ust)?|"
    r"Sep(?:tember)?|"
    r"Oct(?:ober)?|"
    r"Nov(?:ember)?|"
    r"Dec(?:ember)?"
)

day_of_month = r"\d{1,2}"
specific_date_md = f"(?:{month}) {day_of_month}" + r"(?:,? \d{4})?"
specific_date_dm = f"{day_of_month} (?:{month})" + r"(?:,? \d{4})?"

date = f"{specific_date_md}|{specific_date_dm}|Today|Yesterday|Today,|Yesterday,"

hour = r"\d{1,2}"
minute = r"\d{2}"
period = r"AM|PM|"

exact_time_at = f"(?:{date}) at {hour}:{minute} ?(?:{period})"
exact_time_comma = f"(?:{date}) {hour}:{minute} ?(?:{period})"
exact_time = f"{exact_time_at}|{exact_time_comma}"

relative_time_days = r"\b\d{1,2} ?day(?:s?)?"
relative_time_hours = r"\b\d{1,2} ?h(?:rs?)?"
relative_time_mins = r"\b\d{1,2} ?mins?"
relative_time = f"{relative_time_hours}|{relative_time_mins}|{relative_time_days}"
datetime_regex = re.compile(fr"({exact_time}|{relative_time})", re.IGNORECASE)


def parse_datetime(text: str, search=True) -> Optional[datetime]:

    try :
        return dateparser.parse(text)

    except ValueError :
        if search:
            time_match = datetime_regex.search(text)
            if time_match:
                text = time_match.group(0)
            else:
                return None

        return dateparser.parse(text)

