//import React, { type ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode,
  pageTitle?: string
  addClasses?: string
}

const Layout = ({children, pageTitle, addClasses}:LayoutProps) => {
  return (
      <>
      <div className={`min-h-screen flex flex-col bg-background ${addClasses ?? ""}`}>


        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
        >
          Μετάβαση στο κύριο περιεχόμενο
        </a>

  <Header />

  {pageTitle && <title>{pageTitle} — AccessReport</title>}

  <main id="main-content" role="main" className="flex-1 px-6 py-8 bg-background">
    {children}
  </main>

  <Footer />

</div>
      </>
)
}
export default Layout;
