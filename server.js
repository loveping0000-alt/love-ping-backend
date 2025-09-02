const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/static', express.static('public'));

// Content storage
let gifsData = {
  gifs: [
    {
      id: 'romantic_heart_premium',
      name: 'Premium Heart Animation',
      category: 'romantic',
      url: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif',
      thumbnail: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/200.gif',
      premium: true,
      tags: ['love', 'heart', 'premium'],
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'funny_wink_new',
      name: 'Cute Wink',
      category: 'funny',
      url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      thumbnail: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif',
      premium: false,
      tags: ['funny', 'wink', 'cute'],
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'romantic_roses',
      name: 'Blooming Roses',
      category: 'romantic',
      url: 'https://media.giphy.com/media/romantic-roses/giphy.gif',
      thumbnail: 'https://media.giphy.com/media/romantic-roses/200.gif',
      premium: false,
      tags: ['romantic', 'roses', 'flowers'],
      created_at: '2024-01-10T00:00:00Z',
    },
    {
      id: 'premium_diamond_ring',
      name: 'Diamond Ring Sparkle',
      category: 'premium',
      url: 'https://media.giphy.com/media/diamond-ring/giphy.gif',
      thumbnail: 'https://media.giphy.com/media/diamond-ring/200.gif',
      premium: true,
      tags: ['premium', 'diamond', 'proposal'],
      created_at: '2024-01-20T00:00:00Z',
    },
  ],
  last_updated: new Date().toISOString(),
};

let arHintsData = {
  ar_hints: [
    {
      id: 'romantic_rose_3d',
      title: 'Romantic 3D Rose',
      description: 'Beautiful floating 3D rose with love message',
      category: 'romantic',
      model_url: 'https://api.loveping.com/models/rose.glb',
      thumbnail: 'https://api.loveping.com/thumbnails/rose.jpg',
      premium: false,
      tags: ['love', 'rose', '3d'],
      animation_type: 'floating',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'dancing_hearts_ar',
      title: 'Dancing Hearts AR',
      description: 'Multiple hearts dancing around in AR',
      category: 'romantic',
      model_url: 'https://api.loveping.com/models/hearts.glb',
      thumbnail: 'https://api.loveping.com/thumbnails/hearts.jpg',
      premium: false,
      tags: ['hearts', 'dance', 'romantic'],
      animation_type: 'dancing',
      created_at: '2024-01-05T00:00:00Z',
    },
    {
      id: 'premium_hologram',
      title: 'Holographic Love Message',
      description: 'Premium holographic message with effects',
      category: 'premium',
      model_url: 'https://api.loveping.com/models/hologram.glb',
      thumbnail: 'https://api.loveping.com/thumbnails/hologram.jpg',
      premium: true,
      tags: ['premium', 'hologram', 'luxury'],
      animation_type: 'holographic',
      created_at: '2024-01-25T00:00:00Z',
    },
    {
      id: 'galaxy_love_premium',
      title: 'Galaxy Love Experience',
      description: 'Cosmic love with stars and galaxies in AR',
      category: 'premium',
      model_url: 'https://api.loveping.com/models/galaxy.glb',
      thumbnail: 'https://api.loveping.com/thumbnails/galaxy.jpg',
      premium: true,
      tags: ['premium', 'galaxy', 'cosmic'],
      animation_type: 'cosmic',
      created_at: '2024-01-30T00:00:00Z',
    },
  ],
  last_updated: new Date().toISOString(),
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all GIFs
app.get('/content/gifs', (req, res) => {
  try {
    const { category, premium } = req.query;
    let filteredGifs = gifsData.gifs;
    
    if (category) {
      filteredGifs = filteredGifs.filter(gif => gif.category === category);
    }
    
    if (premium !== undefined) {
      const isPremium = premium === 'true';
      filteredGifs = filteredGifs.filter(gif => gif.premium === isPremium);
    }
    
    res.json({
      gifs: filteredGifs,
      total: filteredGifs.length,
      last_updated: gifsData.last_updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GIFs' });
  }
});

// Get all AR hints
app.get('/content/ar-hints', (req, res) => {
  try {
    const { category, premium } = req.query;
    let filteredHints = arHintsData.ar_hints;
    
    if (category) {
      filteredHints = filteredHints.filter(hint => hint.category === category);
    }
    
    if (premium !== undefined) {
      const isPremium = premium === 'true';
      filteredHints = filteredHints.filter(hint => hint.premium === isPremium);
    }
    
    res.json({
      ar_hints: filteredHints,
      total: filteredHints.length,
      last_updated: arHintsData.last_updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AR hints' });
  }
});

// Check for premium updates
app.get('/content/premium-updates', (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newGifs = gifsData.gifs.filter(gif => 
      new Date(gif.created_at) > oneDayAgo
    ).length;
    
    const newArHints = arHintsData.ar_hints.filter(hint => 
      new Date(hint.created_at) > oneDayAgo
    ).length;
    
    res.json({
      new_gifs: newGifs,
      new_ar_hints: newArHints,
      special_offers: [
        {
          id: 'valentine_special',
          title: 'Valentine Special - 50% Off Premium',
          description: 'Get premium GIFs and AR hints at 50% discount',
          valid_until: '2024-02-14T23:59:59Z',
        }
      ],
      last_checked: now.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check updates' });
  }
});

// Add new GIF (Admin endpoint)
app.post('/admin/gifs', (req, res) => {
  try {
    const { name, category, url, thumbnail, premium, tags } = req.body;
    
    const newGif = {
      id: crypto.randomUUID(),
      name,
      category,
      url,
      thumbnail,
      premium: premium || false,
      tags: tags || [],
      created_at: new Date().toISOString(),
    };
    
    gifsData.gifs.push(newGif);
    gifsData.last_updated = new Date().toISOString();
    
    res.json({ success: true, gif: newGif });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add GIF' });
  }
});

// Add new AR hint (Admin endpoint)
app.post('/admin/ar-hints', (req, res) => {
  try {
    const { title, description, category, model_url, thumbnail, premium, tags, animation_type } = req.body;
    
    const newHint = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      model_url,
      thumbnail,
      premium: premium || false,
      tags: tags || [],
      animation_type: animation_type || 'floating',
      created_at: new Date().toISOString(),
    };
    
    arHintsData.ar_hints.push(newHint);
    arHintsData.last_updated = new Date().toISOString();
    
    res.json({ success: true, hint: newHint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add AR hint' });
  }
});

// Get content statistics
app.get('/admin/stats', (req, res) => {
  try {
    const stats = {
      total_gifs: gifsData.gifs.length,
      premium_gifs: gifsData.gifs.filter(g => g.premium).length,
      free_gifs: gifsData.gifs.filter(g => !g.premium).length,
      total_ar_hints: arHintsData.ar_hints.length,
      premium_ar_hints: arHintsData.ar_hints.filter(h => h.premium).length,
      free_ar_hints: arHintsData.ar_hints.filter(h => !h.premium).length,
      last_gif_update: gifsData.last_updated,
      last_hint_update: arHintsData.last_updated,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Love Ping Content Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎬 GIFs API: http://localhost:${PORT}/content/gifs`);
  console.log(`🔮 AR Hints API: http://localhost:${PORT}/content/ar-hints`);
});

module.exports = app;
