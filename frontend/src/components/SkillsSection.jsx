function SkillsSection({ result }) {
  return (
    <section className="skills-grid">
      <div className="skill-panel">
        <div className="skill-heading">
          <div>
            <span className="skill-indicator matched-indicator"></span>

            <h3>Matched skills</h3>
          </div>

          <span>
            {result.matched_skills.length}
          </span>
        </div>

        <div className="skill-list">
          {result.matched_skills.length > 0 ? (
            result.matched_skills.map((skill) => (
              <span
                className="skill-tag matched"
                key={skill}
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="empty-message">
              No direct skill matches were found.
            </p>
          )}
        </div>
      </div>

      <div className="skill-panel">
        <div className="skill-heading">
          <div>
            <span className="skill-indicator missing-indicator"></span>

            <h3>Skills to develop</h3>
          </div>

          <span>
            {result.missing_skills.length}
          </span>
        </div>

        <div className="skill-list">
          {result.missing_skills.length > 0 ? (
            result.missing_skills.map((skill) => (
              <span
                className="skill-tag missing"
                key={skill}
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="empty-message">
              No missing skills detected.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default SkillsSection;