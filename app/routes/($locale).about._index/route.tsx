import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { DefinitionSection } from "./definition-section";
import { ValueSection } from "./value-section";
import type { loader as rootLoader } from "~/root";
import { title } from "~/lib/utils";
import { ClientSection } from "~/components/client-section";
import { TeamSection } from "~/components/team-section";
import { Api } from "~/lib/api";
import { useLoaderData } from "@remix-run/react";
import { ContactSection } from "~/components/contact-section";
import { WorkProcess } from "../($locale)._index/process-section";

export const meta: MetaFunction<unknown, { root: typeof rootLoader }> = ({
  matches,
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch?.translations["about.page.title"]) },
    {
      name: "description",
      content: rootMatch?.translations["about.page.description"],
    },

    // ✅ Open Graph
    {
      property: "og:title",
      content: rootMatch?.translations["about.page.og.title"],
    },
    {
      property: "og:description",
      content: rootMatch?.translations["about.page.og.description"],
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/about" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },

    // ✅ Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content:
        rootMatch?.translations["about.page.twitter.title"] ??
        rootMatch?.translations["about.page.title"],
    },
    {
      name: "twitter:description",
      content:
        rootMatch?.translations["about.page.twitter.description"] ??
        rootMatch?.translations["about.page.description"],
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale ?? "en";

  const api = new Api();

  const teams = await api.getEmployees(locale).then((res) => res.data.data);
  const clients = await api
    .getClients(locale)
    .then((response) => response.data.data);

  return {
    teams,
    clients,
  };
}

export default function Index() {
  const { clients, teams } = useLoaderData<typeof loader>();

  return (
    <>
        <DefinitionSection />

        <ValueSection />

        <TeamSection teams={teams} />

        <WorkProcess />

        <ClientSection clients={clients} />

        <ContactSection />
    </>
  )
}
