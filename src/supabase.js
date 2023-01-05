import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lyrtfcxcalfxjhwemhpk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnRmY3hjYWxmeGpod2VtaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2ODYxODUsImV4cCI6MTk4ODI2MjE4NX0.azockTYpir8R0Njy2-JXVPQPIoeY0ekjsrDIkaer28Q";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
