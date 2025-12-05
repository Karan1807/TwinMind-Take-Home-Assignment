import fs from 'fs-extra';
import path from 'path';
import { WebsiteData } from './types';
import { WEBSITES_DIR } from './config';

function getWebsiteData(): WebsiteData[] {
  const baseDate = new Date('2024-01-12');
  
  return [
    {
      title: 'Tech News Daily - AI Breakthrough Article',
      url: 'https://technewsdaily.com/ai-breakthrough-2024',
      date: new Date(baseDate),
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revolutionary AI Breakthrough Changes Everything</title>
    <meta name="description" content="Scientists announce major breakthrough in AI technology">
    <meta name="author" content="Tech News Daily">
    <meta property="article:published_time" content="${baseDate.toISOString()}">
</head>
<body>
    <header>
        <h1>Tech News Daily</h1>
        <nav>
            <a href="/">Home</a> | 
            <a href="/tech">Tech</a> | 
            <a href="/ai">AI</a> | 
            <a href="/about">About</a>
        </nav>
    </header>
    
    <article>
        <h1>Revolutionary AI Breakthrough Changes Everything We Know About Machine Learning</h1>
        <p class="meta">Published: ${baseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Author: Sarah Johnson</p>
        
        <div class="content">
            <p>In a groundbreaking announcement today, researchers from leading tech companies have unveiled a new AI architecture that promises to revolutionize how machines understand and process information.</p>
            
            <h2>The Discovery</h2>
            <p>The new system, dubbed "Neural Transformer X," demonstrates a 300% improvement in processing efficiency while maintaining accuracy levels that exceed current state-of-the-art models. This breakthrough comes after three years of collaborative research between multiple institutions.</p>
            
            <p>"This is a paradigm shift," said Dr. Michael Chen, lead researcher on the project. "We're not just improving existing technology—we're reimagining what's possible."</p>
            
            <h2>Key Features</h2>
            <ul>
                <li><strong>Enhanced Efficiency:</strong> Processes information 3x faster than previous models</li>
                <li><strong>Lower Energy Consumption:</strong> Uses 40% less computational power</li>
                <li><strong>Improved Accuracy:</strong> Achieves 98.7% accuracy on standard benchmarks</li>
                <li><strong>Scalability:</strong> Can be deployed on devices ranging from smartphones to data centers</li>
            </ul>
            
            <h2>Real-World Applications</h2>
            <p>The implications are vast. Healthcare systems could diagnose diseases faster and more accurately. Autonomous vehicles could make split-second decisions with unprecedented reliability. Language translation could become near-instantaneous and more natural.</p>
            
            <blockquote>
                "This technology will transform industries we haven't even imagined yet," said industry analyst Lisa Park. "We're looking at the next decade of innovation being compressed into the next two years."
            </blockquote>
            
            <h2>What's Next?</h2>
            <p>Commercial applications are expected to begin rolling out in Q2 2024, with early adopters including major cloud providers and enterprise software companies. The research team has committed to open-sourcing core components to accelerate adoption.</p>
            
            <p>For more details, visit the research paper published in Nature Machine Intelligence, or attend the upcoming AI Summit in San Francisco this March.</p>
        </div>
        
        <footer>
            <p>Tags: <a href="/tags/ai">AI</a>, <a href="/tags/machine-learning">Machine Learning</a>, <a href="/tags/technology">Technology</a></p>
            <p>Share this article: <a href="#">Twitter</a> | <a href="#">LinkedIn</a> | <a href="#">Email</a></p>
        </footer>
    </article>
    
    <aside>
        <h3>Related Articles</h3>
        <ul>
            <li><a href="/quantum-computing-advances">Quantum Computing Advances</a></li>
            <li><a href="/future-of-work-ai">The Future of Work in an AI World</a></li>
            <li><a href="/ethics-in-ai">Ethics in AI Development</a></li>
        </ul>
    </aside>
    
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        h1 { color: #333; }
        .meta { color: #666; font-size: 0.9em; }
        blockquote { border-left: 4px solid #333; padding-left: 20px; margin: 20px 0; font-style: italic; }
        footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</body>
</html>`
    },
    {
      title: 'Personal Finance Blog - Investment Strategy',
      url: 'https://personalfinanceblog.com/investment-strategy-2024',
      date: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Investment Strategies for 2024</title>
    <meta name="description" content="Expert advice on building wealth in 2024">
    <meta name="author" content="Personal Finance Blog">
    <meta property="article:published_time" content="${new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()}">
</head>
<body>
    <header>
        <h1>Personal Finance Blog</h1>
        <nav>
            <a href="/">Home</a> | 
            <a href="/investing">Investing</a> | 
            <a href="/saving">Saving</a> | 
            <a href="/retirement">Retirement</a>
        </nav>
    </header>
    
    <article>
        <h1>Smart Investment Strategies for 2024: Building Long-Term Wealth</h1>
        <p class="meta">Published: ${new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Author: Robert Martinez</p>
        
        <div class="content">
            <p>As we navigate through 2024, investors face a complex landscape of opportunities and challenges. This comprehensive guide will help you build a robust investment strategy tailored to your financial goals.</p>
            
            <h2>Understanding the Current Market</h2>
            <p>The investment landscape in 2024 is characterized by several key factors:</p>
            <ul>
                <li>Moderate inflation rates stabilizing around 3-4%</li>
                <li>Technology sector showing strong growth potential</li>
                <li>Real estate markets adjusting to new interest rate environments</li>
                <li>Emerging markets presenting diversification opportunities</li>
            </ul>
            
            <h2>Core Investment Principles</h2>
            <h3>1. Diversification is Key</h3>
            <p>Don't put all your eggs in one basket. A well-diversified portfolio should include:</p>
            <ul>
                <li><strong>Stocks (60-70%):</strong> Mix of large-cap, mid-cap, and international stocks</li>
                <li><strong>Bonds (20-30%):</strong> Government and corporate bonds for stability</li>
                <li><strong>Real Estate (5-10%):</strong> REITs or property investments</li>
                <li><strong>Alternative Investments (5-10%):</strong> Commodities, crypto, or other assets</li>
            </ul>
            
            <h3>2. Dollar-Cost Averaging</h3>
            <p>Invest consistently over time rather than trying to time the market. This strategy reduces the impact of volatility and helps you build wealth gradually.</p>
            
            <h3>3. Long-Term Perspective</h3>
            <p>Successful investing requires patience. Historical data shows that long-term investors (10+ years) consistently outperform those who trade frequently.</p>
            
            <h2>Top Investment Opportunities for 2024</h2>
            <h3>Technology Sector</h3>
            <p>AI, cloud computing, and cybersecurity companies continue to show strong fundamentals. Consider ETFs that track these sectors for diversified exposure.</p>
            
            <h3>Healthcare</h3>
            <p>An aging population and medical innovation drive long-term growth. Pharmaceutical and biotech companies offer solid opportunities.</p>
            
            <h3>Renewable Energy</h3>
            <p>As the world transitions to clean energy, companies in solar, wind, and battery technology present compelling investment cases.</p>
            
            <h2>Common Mistakes to Avoid</h2>
            <ol>
                <li><strong>Emotional Trading:</strong> Don't let fear or greed drive your decisions</li>
                <li><strong>Lack of Research:</strong> Always understand what you're investing in</li>
                <li><strong>Ignoring Fees:</strong> High expense ratios can eat into your returns</li>
                <li><strong>Market Timing:</strong> Time in the market beats timing the market</li>
            </ol>
            
            <h2>Building Your Investment Plan</h2>
            <p>Start by defining your goals:</p>
            <ul>
                <li>Short-term (1-3 years): Emergency fund, vacation, major purchase</li>
                <li>Medium-term (3-10 years): Home down payment, education, business</li>
                <li>Long-term (10+ years): Retirement, financial independence</li>
            </ul>
            
            <p>Then, allocate your investments accordingly. Younger investors can take more risk, while those nearing retirement should prioritize capital preservation.</p>
            
            <blockquote>
                "The best time to start investing was 20 years ago. The second best time is now." - Ancient Investment Wisdom
            </blockquote>
            
            <h2>Getting Started</h2>
            <p>If you're new to investing, start with:</p>
            <ol>
                <li>Building an emergency fund (3-6 months of expenses)</li>
                <li>Maximizing employer 401(k) matches</li>
                <li>Opening a low-cost brokerage account</li>
                <li>Starting with index funds or ETFs</li>
                <li>Automating your investments</li>
            </ol>
            
            <p>Remember, investing is a marathon, not a sprint. Stay disciplined, stay informed, and stay the course.</p>
        </div>
        
        <footer>
            <p><strong>Disclaimer:</strong> This article is for informational purposes only and does not constitute financial advice. Always consult with a qualified financial advisor before making investment decisions.</p>
            <p>Tags: <a href="/tags/investing">Investing</a>, <a href="/tags/wealth-building">Wealth Building</a>, <a href="/tags/financial-planning">Financial Planning</a></p>
        </footer>
    </article>
    
    <aside>
        <h3>Popular Resources</h3>
        <ul>
            <li><a href="/investment-calculator">Investment Calculator</a></li>
            <li><a href="/retirement-planning">Retirement Planning Guide</a></li>
            <li><a href="/tax-strategies">Tax-Efficient Investing</a></li>
        </ul>
    </aside>
    
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; }
        header { border-bottom: 2px solid #2c5f2d; padding-bottom: 10px; margin-bottom: 20px; }
        h1 { color: #2c5f2d; }
        h2 { color: #4a7c59; margin-top: 30px; }
        h3 { color: #6b9e78; }
        .meta { color: #666; font-size: 0.9em; }
        blockquote { border-left: 4px solid #2c5f2d; padding-left: 20px; margin: 20px 0; font-style: italic; color: #555; }
        footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; }
        ul, ol { margin: 15px 0; padding-left: 30px; }
        li { margin: 8px 0; }
    </style>
</body>
</html>`
    },
  ];
}

export async function generateWebsites(): Promise<void> {
  console.log('\n🌐 Generating Website Files...\n');
  
  await fs.ensureDir(WEBSITES_DIR);
  
  const websites = getWebsiteData();
  
  for (let i = 0; i < websites.length; i++) {
    const website = websites[i];
    const filename = `website-${i + 1}-${website.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    const outputPath = path.join(WEBSITES_DIR, filename);
    
    console.log(`🌐 Website ${i + 1}: ${website.title}`);
    console.log(`   URL: ${website.url}`);
    console.log(`   Date: ${website.date.toISOString().split('T')[0]}`);
    
    await fs.writeFile(outputPath, website.content);
    console.log(`   ✅ Saved: ${filename}`);
    
    // Also save metadata
    const metadata = {
      title: website.title,
      url: website.url,
      date: website.date.toISOString(),
      filename: filename,
    };
    const metadataPath = path.join(WEBSITES_DIR, `website-${i + 1}-metadata.json`);
    await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  }
  
  console.log(`\n✅ Website generation complete! Files saved to: ${WEBSITES_DIR}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateWebsites().catch(console.error);
}

