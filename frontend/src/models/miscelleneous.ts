
/*
    {
        "filter": [
            {
            "name": "filter1"
            },
            {
            "name": "filter2"
            }
        ],
        "moreFieldsIfNeeded": "...",
    }
*/
interface filter {
    filter: string;
}
export interface FiltersData {
    filters: filter[];
}