// defaults to the global scope
import { superbase } from "@/utils/supabase/superbaseClient";
await superbase.auth.signOut();
// sign out from the current session only
await superbase.auth.signOut({ scope: "local" });

//TODO: rename all to supabase from superbase
