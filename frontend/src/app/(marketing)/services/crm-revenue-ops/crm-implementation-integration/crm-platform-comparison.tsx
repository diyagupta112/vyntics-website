import { Container } from "@/components/ui/container";
import { crmComparison } from "./content";
import styles from "./page.module.css";

export function CrmPlatformComparison() {
  const { platforms, rows } = crmComparison;
  return <section className={styles.compareSection} id="which-crm" aria-labelledby="which-crm-title">
    <Container>
      <header className={styles.heading} data-reveal="which-crm-heading">
        <h2 id="which-crm-title">Which CRM is right for you?</h2>
        <p>Compare how HubSpot, Zoho CRM, and Microsoft Dynamics 365 differ, so you can see which platform may fit your processes, connected systems, and team.</p>
      </header>
      <div className={styles.compareFrame} data-reveal="which-crm-table">
        <div className={styles.tableWrap} role="region" aria-label="CRM platform comparison table, scrollable" tabIndex={0}>
          <table className={styles.comparison}>
            <caption className={styles.srOnly}>Comparison of HubSpot, Zoho CRM, and Microsoft Dynamics 365</caption>
            <thead>
              <tr>
                <th scope="col"><span className={styles.srOnly}>Comparison point</span></th>
                {platforms.map(platform => <th scope="col" key={platform}>{platform}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, index) => <td key={platforms[index]}>{cell}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.compareHelp} data-reveal="which-crm-help">
        <div>
          <p className={styles.compareEyebrow}>Need help choosing?</p>
          <h3>Choose the CRM that fits your process and your team.</h3>
          <p>We help you evaluate the right CRM based on your sales process, data, connected systems, and users, then implement it around how your business actually works.</p>
        </div>
        <a className={styles.compareCta} href="#contact">Talk to our CRM experts <span aria-hidden="true">→</span></a>
      </div>
    </Container>
  </section>;
}
