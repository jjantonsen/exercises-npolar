import io
import requests

import pandas as pd

# Parameters
base_url = 'https://api.npolar.no/marine/biology/sample/'
fields = ['expedition', 'utc_date', 'programs', 'conveyance']
limit = 'all'
out_format = 'json'
variant = 'array'
output_path = '01_list_expeditions.ndjson'

# Definitions
def build_url():
    return f"{base_url}?q=&fields={','.join(fields)}&limit={limit}&format={out_format}&variant={variant}"

def fillNaNsWithList(df, col):
    for row in df.loc[df[col].isnull(), col].index:
        df.at[row, col] = []
    return df

if __name__ == '__main__':
    # Fetch data from API
    url = build_url()
    print(f'Fetching data from {url}...')
    url_data = requests.get(url).content
    data = pd.read_json(io.StringIO(url_data.decode('utf-8')))
    print(f'Got {data.shape[0]} lines')
    print(f'Found {len(data.expedition.unique())} unique expeditions')

    # Process data and aggregate on expedition column
    data_mod = data.rename(columns={'utc_date': 'first_sampling_date'})
    data_mod['last_sampling_date'] = data_mod['first_sampling_date']
    expeditions = data_mod.groupby('expedition', as_index=False).agg({
        'conveyance': min,
        'programs': min,
        'first_sampling_date': min,
        'last_sampling_date': max
    }).sort_values('first_sampling_date')

    # Fill NaNs to make data conform
    expeditions = fillNaNsWithList(expeditions, 'programs')
    expeditions = expeditions.fillna({'conveyance': '', 'first_sampling_date': '', 'last_sampling_date': ''})

    # Write to file
    print(f'Writing to {output_path}...')
    expeditions.to_json(output_path, orient='records', lines=True)
    print('Done!')