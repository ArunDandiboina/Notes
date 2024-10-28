var year = new Date().getFullYear();
export default function Footer() {
    return (
        <footer>
            <p>© {year} Keeper App</p>
        </footer>
    );
}