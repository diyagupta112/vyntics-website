import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import design from "@/components/sections/home/featured-work.module.css";
import listing from "@/app/(marketing)/case-studies/page.module.css";
import styles from "./case-study-skeleton.module.css";

export function FeaturedCaseStudySkeleton() {
  return <div className={styles.featured} aria-busy="true" role="status" aria-label="Loading featured case studies">
    <div className={`${design.card} ${design.cardGrid} ${styles.featuredCard}`} aria-hidden="true">
      <div className={design.visualFrame}><Skeleton className={`${design.visual} ${styles.media}`} /></div>
      <div className={design.content}>
        <div><Skeleton style={{ width:"38%", height: ".7rem", marginBottom:"1rem" }} /><SkeletonLines className={styles.featuredTitle} widths={["90%", "70%"]} /><SkeletonLines className={styles.summary} /></div>
        <div className={styles.chips}><Skeleton /><Skeleton /><Skeleton /></div>
        <div className={design.cardFooter}><div className={styles.chips}><Skeleton /><Skeleton /><Skeleton /></div><Skeleton style={{ width:"9rem", height:"2.5rem" }} /></div>
      </div>
    </div>
    <div className={styles.controls} aria-hidden="true"><div className={styles.dots}><Skeleton /><Skeleton /><Skeleton /></div><div className={styles.navigation}><Skeleton className={styles.circle} /><Skeleton className={styles.circle} /><Skeleton className={styles.circle} /></div></div>
  </div>;
}

export function CaseStudyListingSkeleton() {
  return <div aria-busy="true" role="status" aria-label="Loading case studies">
    <div className={`${listing.listingControls} ${styles.filters}`} aria-hidden="true">{[0,1,2].map(index => <div key={index}><Skeleton style={{ width:"7rem", height:".7rem", marginBottom:".5rem" }} /><Skeleton style={{ height:"3rem" }} /></div>)}</div>
    <div className={listing.listingStatus} aria-hidden="true"><Skeleton style={{ width:"8rem", height:".8rem" }} /></div>
    <div className={listing.otherGrid} aria-hidden="true">{[0,1,2].map(index => <div className={`${listing.otherCard} ${styles.listCard}`} key={index}>
      <Skeleton className={listing.otherMedia} style={{ height:"auto" }} />
      <div className={listing.otherCopy}><Skeleton style={{ width:"65%", height:".7rem" }} /><SkeletonLines className={styles.listTitle} widths={["95%","70%"]} /><SkeletonLines className={styles.summary} /><Skeleton style={{ width:"8rem", marginTop:"1.25rem" }} /></div>
    </div>)}</div>
  </div>;
}
