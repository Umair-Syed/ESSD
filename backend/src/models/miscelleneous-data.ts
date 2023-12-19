import { InferSchemaType, Schema, model } from "mongoose";


/*
    {
        "filters": [
            {
            "filter": "filter1"
            },
            {
            "filter": "filter2"
            }
        ],
        "moreFieldsIfNeeded": "...",
    }
*/

const filtersSchema = new Schema({
  filter: {
    type: String,
    required: true
  }
});

const miscellaneousSchema = new Schema({
  filters: [filtersSchema]
}, { timestamps: true });

type IMiscellaneousSchema = InferSchemaType<typeof miscellaneousSchema>;

export default model<IMiscellaneousSchema>("MiscellaneousData", miscellaneousSchema);
