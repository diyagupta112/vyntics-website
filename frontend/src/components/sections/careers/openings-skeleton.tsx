import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import styles from "@/app/(marketing)/careers/page.module.css";

export function OpeningsSkeleton() {
  return <div className={styles.openingsGrid} aria-label="Loading current openings" role="status" aria-busy="true">
    {[0,1].map(index => <div className={styles.openingCard} key={index} aria-hidden="true"><div className={styles.openingCardLink}>
      <div className={styles.openingTopline}><Skeleton style={{width:"32%",height:".7rem"}} /><Skeleton style={{width:"24%",height:".7rem"}} /></div>
      <Skeleton style={{width:"75%",height:"1.7rem",marginTop:"1.25rem"}} />
      <SkeletonLines widths={["95%","80%"]} className={styles.openingSkeletonDescription} />
      <div className={styles.openingSkeletonMeta}><Skeleton /><Skeleton /></div>
      <Skeleton style={{width:"7rem",marginTop:"auto"}} />
    </div></div>)}
  </div>;
}
