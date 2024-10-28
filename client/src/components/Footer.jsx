var year = new Date().getFullYear();
export default function Footer() {
    return (
        <footer>
            <p>© {year} Notes App</p>
        </footer>
    );
}