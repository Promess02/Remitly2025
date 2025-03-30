import pandas as pd

df = pd.read_csv("Banks.csv", delimiter=",", quotechar='"', encoding="utf-8")
df.to_csv("banks_fixed.csv", index=False, quoting=1)  # Force quotes where needed