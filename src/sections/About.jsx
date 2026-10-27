import Polaroids from "../components/Polaroids";
import Section from "../components/Section";
import { tint } from "../palette";

/**
 * The About panel, with polaroids tucked behind it (the panel stacks above
 * them): peeking out from its right edge on desktop, hanging from its bottom
 * edge on phones.
 */
export default function About({ isPhone, onViewingPhoto }) {
  const panel = (
    <Section id="about" title="About" isPhone={isPhone} style={styles.above}>
      <p style={styles.bodyText}>
        I'm Jason, a student at Purdue University. I am majoring in Computer Science with a concentration in
        Computer Graphics and Visualization, as well as a major in Game Development. I care a lot about crafting
        experiences that are fun and interesting, whether it's a game, a website, or any other unique interactive project.
        I have experience in full-stack web development, game development in Godot, Unreal Engine, and Unity, as well as UI/UX design.
      </p>
      <br />
      <p style={styles.bodyText}>
        Outside of development, I enjoy playing video games, especially ones with strong narrative and unique mechanics. I love hiking and exploring outdoors, and I spend a lot of time volunteering for Purdue's Dance Marathon, which raises money for the Riley Hospital for Children. If you'd be interested in donating there,{" "}
        <a
          href="https://events.dancemarathon.com/participants/jasongott"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.inlineLink}
        >
          here's my fundraising page!
        </a>
      </p>
    </Section>
  );

  return (
    <div style={styles.wrap}>
      <Polaroids isPhone={isPhone} onViewingChange={onViewingPhoto} />
      {panel}
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
  },
  above: {
    position: "relative",
    zIndex: 10,
  },
  bodyText: {
    color: tint(36, 91, 0.78),
    maxWidth: "100%",
  },
  inlineLink: {
    color: tint(45, 86),
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
};
