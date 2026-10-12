import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";
import card from "@/app/(marketing)/recognitions/page.module.css";
import feed from "./stacking-feed.module.css";
import styles from "./recognition-skeleton.module.css";

export function RecognitionSkeleton() {
  return <div className={styles.carousel} aria-label="Loading recognitions and certifications" role="status" aria-busy="true">
    <div className={styles.cards} aria-hidden="true">{[0,1].map(index => <div className={card.credential} key={index}>
      <div className={card.credentialIdentity}><Skeleton className={styles.badge} /><SkeletonLines widths={["80%","58%"]} className={styles.title} /></div>
      <SkeletonLines widths={["98%","92%","82%"]} className={styles.description} />
    </div>)}</div>
    <div className={styles.controls} aria-hidden="true"><Skeleton className={styles.control} /><Skeleton style={{width:"3rem",height:".4rem",marginInline:"auto"}} /><Skeleton className={styles.control} /></div>
  </div>;
}

export function RecognitionFeedSkeleton() {
  return <div className={feed.feed} aria-busy="true" role="status" aria-label="Loading recognition updates">
    <div className={feed.viewport} aria-hidden="true"><div className={styles.feedCards}>
      {[0,1,2].map(index => <div className={feed.tile} key={index}><Skeleton className={feed.thumbnail} /><div className={styles.feedCopy}><SkeletonLines widths={["98%","85%"]} /><Skeleton style={{width:"70%",marginTop:".7rem"}} /><Skeleton style={{width:"35%",height:".6rem",marginTop:".7rem"}} /></div></div>)}
    </div></div>
  </div>;
}
