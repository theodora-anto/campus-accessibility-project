const Footer = ()=>{
    const currentYear: number = new Date().getFullYear()

    return (
        <footer role="contentinfo" className="border-t border-border bg-card px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">
                AccessReport &copy; {currentYear} Σύστημα Αναφοράς Προβλημάτων Προσβασιμότητας
            </p>
        </footer>
    )
}
export default Footer;