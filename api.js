import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const addSubmission = async (submission) => {
  const { data, error } = await supabase
    .from("submissions")
    .insert([{ ...submission }]);
};
