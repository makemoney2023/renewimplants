import { ScrollWorld } from "@/components/scroll-world";
import { getOrganizationSchema } from "@/lib/site-schema";

const schema = getOrganizationSchema();

export default function Home() {
  return (
    <>
      <ScrollWorld />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
