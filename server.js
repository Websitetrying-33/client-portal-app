// Seed initial data para sa Sydney Agency Pitch
        db.get(`SELECT COUNT(*) as count FROM invoices`, (err, row) => {
            if (!err && row && row.count === 0) {
                // 1. Invoices (Naka-link sa MYOB/Stripe concept)
                db.run(`INSERT INTO invoices (invoiceRef, billingPeriod, scope, amount, status) VALUES ('MYOB-INV-2026-088', 'August – September 2026', 'Social Media Management, Reels Creative Retainer & Lead Ads Scale', 'AUD $4,850.00', 'Pending Payment')`);
                
                // 2. Contracts & Agreements
                db.run(`INSERT INTO contracts (title, status, signedDate) VALUES ('Master Service Agreement & NDA (Sydney Agency)', 'Signed & Verified', '2025-10-15')`);
                db.run(`INSERT INTO contracts (title, status, signedDate) VALUES ('Q3-Q4 Influencer & Content Licensing Addendum', 'Signed & Verified', '2026-01-10')`);

                // 3. Videos / Content Feedback (Naka-link sa Dropbox concept)
                db.run(`INSERT INTO videos (title, status) VALUES ('Reel #12 - Bondi Beach Lifestyle Promo (v2).mp4', 'Pending Review')`);
                db.run(`INSERT INTO videos (title, status) VALUES ('Client UGC Testimonial - Sydney CBD Shoot.mp4', 'Approved ✓')`);

                // 4. Schedule & Content Calendar
                db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES ('Instagram', 'Behind-the-Scenes Reel: Sydney Office Launch', 'Tomorrow at 10:00 AM AEST', 'Ready')`);
                db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES ('TikTok', 'Top 3 Social Media Mistakes Growing Brands Make', 'Aug 30, 2026 - 3:00 PM AEST', 'Scheduled')`);

                // 5. Tasks & Milestones
                db.run(`INSERT INTO tasks (title, priority, status) VALUES ('Setup Client Portal Onboarding & Zapier Sync', 'High', 'Completed')`);
                db.run(`INSERT INTO tasks (title, priority, status) VALUES ('Q3 Meta Ads & Lead Pipeline Customization', 'High', 'In Progress')`);

                // 6. Lead Pipeline & ROI
                db.run(`INSERT INTO leads (qualifiedLeads, bookedCalls, roi) VALUES ('184 (+24%)', '42 (82% show rate)', '5.4x')`);

                // 7 & 8. Brand Assets Storage (Dropbox Vault)
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Sydney_Agency_Brand_Guidelines_2026.pdf', '5.1 MB', '#')`);
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Client_Raw_Footage_Dropbox_Folder.link', '124 GB', '#')`);
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Q3_Performance_Report_MYOB_Export.pdf', '2.8 MB', '#')`);
            }
        });
