import Link from "next/link"

import { concepts } from "@/lib/concepts"

/** The review index: every concept with its idea and its honest risk. */
export default function ConceptsIndex() {
  return (
    <main className="mx-auto max-w-3xl bg-white px-5 pt-24 pb-24 text-neutral-900">
      <h1 className="text-3xl font-semibold tracking-tight">{concepts.length} directions for jhovanie.dev</h1>
      <p className="mt-3 text-neutral-600">
        Each page is a first screen plus one interaction or scroll scene, built far enough to judge the motion. Pick one,
        or mix two: &ldquo;Night city&rsquo;s skyline with Two views&rsquo; switch.&rdquo;
      </p>
      <ol className="mt-10 flex flex-col gap-6">
        {concepts.map((concept) => (
          <li key={concept.slug}>
            <Link href={`/concepts/${concept.slug}`} className="group block rounded-lg p-4 hover:bg-neutral-100">
              <h2 className="text-xl font-semibold group-hover:underline">{concept.name}</h2>
              <p className="mt-1">{concept.thesis}</p>
              <p className="mt-1 text-sm text-neutral-600">Risk: {concept.risk}</p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
