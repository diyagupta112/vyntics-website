import { Container } from "@/components/ui/container";
import { biToolComparison } from "./content";
import styles from "./page.module.css";

export function BiToolComparison() {
  const { tools, rows } = biToolComparison;
  return <section className={styles.compareSection} id="bi-tool-comparison" aria-labelledby="bi-tool-comparison-title">
    <Container>
      <header className={styles.heading} data-reveal="bi-tool-comparison-heading">
        <h2 id="bi-tool-comparison-title">Which BI tool is right for you?</h2>
        <p>Compare how Power BI, Tableau, and Amazon QuickSight differ, so you can see which platform may fit your existing systems, reporting needs, and team.</p>
      </header>
      <div className={styles.compareFrame} data-reveal="bi-tool-comparison-table">
        <div className={styles.tableWrap} role="region" aria-label="BI tool comparison table, scrollable" tabIndex={0}>
          <table className={styles.comparison}>
            <caption className={styles.srOnly}>Comparison of Power BI, Tableau, and Amazon QuickSight</caption>
            <thead>
              <tr>
                <th scope="col"><span className={styles.srOnly}>Comparison point</span></th>
                {tools.map(tool => <th scope="col" key={tool}>{tool}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, index) => <td key={tools[index]}>{cell}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.compareHelp} data-reveal="bi-tool-comparison-help">
        <div>
          <p className={styles.compareEyebrow}>Need help choosing?</p>
          <h3>Choose the tool that fits your data and your team.</h3>
          <p>We help you evaluate the right BI platform based on your data environment, reporting requirements, users, and long-term analytics goals, then implement it around how your business actually works.</p>
        </div>
        <a className={styles.compareCta} href="/#contact">Talk to our BI experts <span aria-hidden="true">→</span></a>
      </div>
    </Container>
  </section>;
}
