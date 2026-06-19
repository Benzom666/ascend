import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="d-flex justify-content-between w-100">
          <ul className="d-flex mb-0">
            <li>
              <Link href="/OurStory">About</Link>
            </li>
            <li>
              <Link href="#">Mobile</Link>
            </li>
            <li>
              <Link href="/TermOfUse">Terms</Link>
            </li>
            <li>
              <Link href="/PrivacyPolicies">Privacy</Link>
            </li>
            <li>
              <Link href="/FAQ">Help</Link>
            </li>
            <li>
              <Link href="#">Press</Link>
            </li>
          </ul>
          <p className="mb-0">&copy; 2026 Ascend | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
