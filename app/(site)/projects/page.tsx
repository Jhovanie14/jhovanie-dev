import { redirect } from "next/navigation"

// The site is one page now; this address flies straight to its stop on the desk.
export default function Page() {
  redirect("/#projects")
}
