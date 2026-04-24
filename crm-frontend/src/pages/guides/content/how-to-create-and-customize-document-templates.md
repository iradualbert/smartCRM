# How to Create and Customize Document Templates

You do not need a custom template to start using Beinpark.

Every document type already has a professional default template. Your team can create quotations, invoices, proformas, receipts, and delivery notes immediately.

Create a custom template when you want to:

- add your own branding or layout
- change spacing, headings, or table styling
- include legal or payment wording specific to your business
- prepare different document designs for different clients or use cases

## The easiest way to start

The cleanest workflow is:

1. Open **Templates**.
2. Download the default template for the document type you want.
3. Open it in Microsoft Word.
4. Adjust the layout, fonts, colors, spacing, or branding.
5. Save the file as `.docx`.
6. Upload it as a new template.

This is usually faster and safer than building a template from a blank document.

## Where to download the default

You can download the system default template from:

- the **Templates** page
- the **Create Template** page
- template actions linked from document forms

That gives you a working starting file with the right placeholder structure already in place.

## What should you customize?

Common professional changes include:

- company logo placement
- document title styling
- sender and customer blocks
- line-item table styling
- totals section styling
- footer wording
- payment or delivery notes

Try to keep the content structure clear and easy to scan. Most customers care more about readability than decoration.

## Keep the placeholders intact

Beinpark fills the document using placeholders inside the template.

Examples:

```text
[[DocumentNumber]]
[[DocumentDate]]
[[CompanyLegalName]]
[[ClientName]]
[[LineDescription]]
[[LineQty]]
[[LineUnitPrice]]
[[LineTotal]]
[[Total]]
[[Notes]]
```

You can move placeholders, style them, or place them inside a different layout. Just keep the placeholder names unchanged.

## Logo support

The default templates support the organization logo through the `[[CompanyLogo]]` placeholder.

If your organization has a logo uploaded, the document renderer can place it automatically. If no logo is available, the logo area stays empty.

## A good template workflow in Word

When editing the downloaded default template:

1. keep the placeholder text exactly as it is
2. change fonts, colors, borders, and spacing as needed
3. move sections only if the document still reads clearly
4. avoid converting placeholders into images or shapes
5. save the final file as `.docx`

## Suggested first customizations

If you are making your first template, start small:

- add your logo
- tighten the heading area
- restyle the line-item table
- refine the totals block
- add a short footer note

That usually gets you to a polished result without creating maintenance headaches.

## When to keep using the default

Stay with the default template if:

- you are testing the app
- your team needs to move quickly
- you do not yet have a final brand layout
- your customers care more about speed than visual customization

That is a completely normal way to launch.

## Final check before upload

Before uploading your custom template:

- confirm the file opens normally in Word
- confirm the placeholders are still present
- confirm line-item rows still contain the line placeholders
- confirm the document is saved as `.docx`

## Conclusion

The best production-ready path is simple: start with the default template, make focused brand changes, then upload your version for the organization.

[Open templates](/templates)
