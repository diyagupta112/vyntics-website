import { cache } from "react";
import { getBlogs, type Blog } from "@/lib/blogs";
import { getCaseStudies, type CaseStudyListItem } from "@/lib/case-studies";
import type { CloudSubPageKey } from "./pages";
import { cloudReferenceSections } from "./sections";
import { getItemsForService } from "@/lib/related-services";

const topics: Record<CloudSubPageKey, RegExp> = {
  migration: /\b(migrat(?:ion|e|ing)|rehost(?:ing)?|replatform(?:ing)?|refactor(?:ing)?)\b/i,
  devops: /\b(devops|ci\/cd|continuous (?:integration|delivery|deployment)|site reliability|deployment pipeline|incident response|kubernetes)\b/i,
  cost: /\b(finops|cost[- ](?:optimi[sz]ation|management|audit|saving)|cloud (?:spend|bill)|sav(?:ing|ings) plans|rightsizing)\b/i,
};
const cloudContext = /\b(cloud|aws|azure|google cloud|on[- ]premises?)\b/i;

/** Reads the existing service feeds plus site-wide content for the fallback. */
export const getCloudReferences = cache(async () => {
  const [studies, posts, recentStudies, recentPosts] = await Promise.all([
    getCaseStudies("cloud_foundations").catch(() => [] as CaseStudyListItem[]),
    getBlogs("cloud_foundations"),
    getCaseStudies().catch(() => [] as CaseStudyListItem[]),
    getBlogs(),
  ]);
  return { studies, posts: posts.blogs, recentStudies, recentPosts: recentPosts.blogs.filter(post => !post.status || post.status === "published") };
});

export function selectCloudStudies(studies: readonly CaseStudyListItem[], key: CloudSubPageKey) {
  return studies.filter(study => {
    const text = [study.title, study.excerpt, ...study.tags, ...study.tech_stack].join(" ");
    return (study.related_service === "cloud_foundations" || cloudContext.test(text) || topics[key].test(study.tags.join(" "))) && topics[key].test(text);
  }).slice(0, 1);
}

export function selectCloudInsights(posts: readonly Blog[], key: CloudSubPageKey, pillarPosts: readonly Blog[] = posts.slice(0, 3)) {
  // The pillar displays the first three entries from this same public feed.
  const pillarSlugs = new Set(pillarPosts.map(post => post.slug));
  return posts.filter(post => {
    if (pillarSlugs.has(post.slug) || (post.status && post.status !== "published")) return false;
    const text = `${post.title} ${post.category} ${post.excerpt}`;
    if (post.related_service !== "cloud_foundations" && !cloudContext.test(text) && !topics[key].test(post.category)) return false;
    // Assign an overlapping article once, rather than repeat it across sub-pages.
    const assigned = (["cost", "migration", "devops"] as const).find(topic => topics[topic].test(text));
    return assigned === key;
  }).slice(0, 3);
}

function uniqueRecent<T extends { slug: string; published_at: string }>(items: readonly T[]) {
  return [...new Map(items.map(item => [item.slug, item])).values()]
    .sort((a, b) => (Date.parse(b.published_at) || 0) - (Date.parse(a.published_at) || 0));
}

function recentOutsidePillar<T extends { slug: string; published_at: string }>(items: readonly T[], pillarItems: readonly T[], limit: number) {
  const pillarSlugs = new Set(pillarItems.map(item => item.slug));
  const recent = uniqueRecent(items);
  return [...recent.filter(item => !pillarSlugs.has(item.slug)), ...recent.filter(item => pillarSlugs.has(item.slug))].slice(0, limit);
}

export function resolveCloudReferenceSections(references: Awaited<ReturnType<typeof getCloudReferences>>, key: CloudSubPageKey, { strictRelevance = false }: { strictRelevance?: boolean } = {}) {
  const allStudies = uniqueRecent([...references.recentStudies, ...references.studies]);
  const allPosts = uniqueRecent([...references.recentPosts, ...references.posts]);
  const studyPool = strictRelevance ? getItemsForService(allStudies, "cloud_foundations") : allStudies;
  const postPool = strictRelevance
    ? getItemsForService(allPosts, "cloud_foundations").filter(post => !post.status || post.status === "published")
    : allPosts;
  const relevantStudies = selectCloudStudies(studyPool, key).slice(0, cloudReferenceSections.caseStudies.relevantLimit);
  // Prefer topic articles not on the pillar, but keep relevance ahead of a general fallback.
  const relevantPosts = selectCloudInsights(postPool, key, references.posts.slice(0, 3));
  const insights = relevantPosts.length ? relevantPosts : selectCloudInsights(postPool, key, []);
  const studies = relevantStudies.length ? relevantStudies : strictRelevance ? [] : recentOutsidePillar(allStudies, references.studies, cloudReferenceSections.caseStudies.recentLimit);
  const posts = insights.length ? insights : strictRelevance ? [] : recentOutsidePillar(allPosts, references.posts.slice(0, 3), cloudReferenceSections.insights.recentLimit);
  return {
    studies, insights: posts,
    studiesState: relevantStudies.length ? "relevant" : studies.length ? "recent" : "empty",
    insightsState: insights.length ? "relevant" : posts.length ? "recent" : "empty",
  } as const;
}
