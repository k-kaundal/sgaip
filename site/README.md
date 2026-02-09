# SGAIP Website

Beautiful GitHub Pages website for the Stateless Global Agent Identity Protocol.

## Pages

- **index.html** - Main landing page with features, quick start, and overview
- **specs.html** - Technical specifications and documentation
- **about.html** - About SGAIP, use cases, and philosophy
- **404.html** - Custom 404 error page

## Styling

The website uses a custom CSS stylesheet (`assets/css/style.css`) with:
- Modern, responsive design
- Dark-themed navigation
- Feature cards with hover effects
- Code block highlighting
- Mobile-friendly layout
- Professional color scheme

## Colors

- **Primary**: #1e3c72 (Dark Blue)
- **Secondary**: #2a5298 (Medium Blue)
- **Accent**: #00d4ff (Cyan)
- **Background Light**: #f8f9fa
- **Background Dark**: #1a1a1a

## Features

✅ **Responsive Design** - Works on all devices
✅ **SEO Optimized** - Meta tags, structured data
✅ **Fast Loading** - Pure HTML/CSS, no heavy frameworks
✅ **Accessible** - WCAG compliant markup
✅ **GitHub Integration** - Easy navigation to repository
✅ **Professional Layout** - Modern web design patterns

## Deployment

This website is configured to deploy automatically to GitHub Pages when pushed to the main branch.

### Configuration Files

- **_config.yml** - Jekyll configuration for GitHub Pages
- **index.html** - Main entry point
- **assets/css/style.css** - All styling

All pages are static HTML, so no build process is required.

## Building Locally

To test the website locally before deployment:

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using Ruby Jekyll
jekyll serve
```

Then visit `http://localhost:8000` or `http://localhost:4000`

## Contributing

The website is powered by the content and specifications in the main SGAIP repository. To contribute:

1. Update the repository content
2. The website will be automatically updated
3. Push changes to `main` branch
4. GitHub Pages will deploy automatically

## License

Same as SGAIP - MIT License
