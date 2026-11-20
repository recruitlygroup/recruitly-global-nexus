// Route target for /australia/*: picks a PageSpec by slug and renders it with the shared block system.
import ContentPage from "@/components/blocks/ContentPage";
import { AUSTRALIA_PAGES } from "@/data/pages/australia";
import type { PageSpec } from "@/components/blocks/spec";

const AustraliaPage = ({ page }: { page: keyof typeof AUSTRALIA_PAGES }) => <ContentPage spec={AUSTRALIA_PAGES[page] as PageSpec} />;
export default AustraliaPage;
