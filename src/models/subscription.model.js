import mongoose,{Schema} from "mongoose";

const subscriptionschema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref:"USer"
    },
    chennel:{
        type: Schema.Types.ObjectId,
        ref:"USer"
    }
},{timestamps:true})

export const Subcription = mongoose.model("Subcription",subscriptionschema)