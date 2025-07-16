// Interactive Hero Background Animation
class HeroAnimation {
    constructor() {
        this.canvas = document.getElementById('heroCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Animation properties
        this.mouse = { x: 0, y: 0 };
        this.particles = [];
        this.connections = [];
        this.animationId = null;
        this.isIdle = false;
        this.idleTimer = null;
        this.lastMouseMove = Date.now();
        
        // Configuration
        this.config = {
            particleCount: 80,
            maxDistance: 150,
            mouseInfluence: 100,
            particleSpeed: 0.5,
            idleTimeout: 15000, // 15 seconds
            colors: {
                primary: '#FF6584',
                secondary: '#64FFDA',
                tertiary: '#BB86FC',
                background: '#0D0D0D'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
        
        // Initialize parallax
        this.initParallax();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate particles on resize
        if (this.particles.length > 0) {
            this.createParticles();
        }
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                originalVx: (Math.random() - 0.5) * this.config.particleSpeed,
                originalVy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            this.config.colors.primary,
            this.config.colors.secondary,
            this.config.colors.tertiary
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    bindEvents() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.lastMouseMove = Date.now();
            
            if (this.isIdle) {
                this.isIdle = false;
                this.resetIdleTimer();
            }
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.lastMouseMove = Date.now();
            }
        }, { passive: true });
        
        // Reset idle timer
        this.resetIdleTimer();
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });
    }
    
    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.isIdle = true;
        }, this.config.idleTimeout);
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update pulse for breathing effect
            particle.pulse += particle.pulseSpeed;
            
            // Mouse influence
            if (!this.isIdle) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.mouseInfluence) {
                    const force = (this.config.mouseInfluence - distance) / this.config.mouseInfluence;
                    const angle = Math.atan2(dy, dx);
                    
                    // Create swirl effect
                    const swirl = force * 0.1;
                    particle.vx += Math.cos(angle + Math.PI/2) * swirl;
                    particle.vy += Math.sin(angle + Math.PI/2) * swirl;
                    
                    // Repulsion effect
                    particle.vx -= Math.cos(angle) * force * 0.05;
                    particle.vy -= Math.sin(angle) * force * 0.05;
                }
            }
            
            // Gradually return to original velocity
            particle.vx += (particle.originalVx - particle.vx) * 0.02;
            particle.vy += (particle.originalVy - particle.vy) * 0.02;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Update opacity based on pulse
            particle.opacity = 0.3 + Math.sin(particle.pulse) * 0.3;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            // Create glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 15;
            
            // Set particle style
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.maxDistance) {
                    const opacity = (this.config.maxDistance - distance) / this.config.maxDistance;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = opacity * 0.3;
                    this.ctx.strokeStyle = this.particles[i].color;
                    this.ctx.lineWidth = 1;
                    
                    // Add glow to connections
                    this.ctx.shadowColor = this.particles[i].color;
                    this.ctx.shadowBlur = 5;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                    
                    this.connections.push({
                        start: this.particles[i],
                        end: this.particles[j],
                        opacity: opacity
                    });
                }
            }
        }
    }
    
    drawMouseInfluence() {
        if (this.isIdle) return;
        
        // Draw mouse influence circle
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = this.config.colors.secondary;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = this.config.colors.secondary;
        this.ctx.shadowBlur = 20;
        
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, this.config.mouseInfluence, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    animate() {
        // Clear canvas
        this.ctx.fillStyle = this.config.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        this.drawMouseInfluence();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resumeAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }
    
    // Parallax effect for background layers
    initParallax() {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            parallaxLayers.forEach((layer, index) => {
                const speed = (index + 1) * 0.02;
                const x = mouseX * speed * 100;
                const y = mouseY * speed * 100;
                
                layer.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
}

// Floating Icons Animation
class FloatingIconsAnimation {
    constructor() {
        this.icons = document.querySelectorAll('.floating-icon');
        this.init();
    }
    
    init() {
        this.icons.forEach((icon, index) => {
            // Add hover effects
            icon.addEventListener('mouseenter', () => {
                this.createSparkles(icon);
            });
            
            // Add click effects
            icon.addEventListener('click', () => {
                this.createClickEffect(icon);
            });
        });
    }
    
    createSparkles(element) {
        const rect = element.getBoundingClientRect();
        const sparkleCount = 8;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #64FFDA;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                box-shadow: 0 0 10px #64FFDA;
            `;
            
            document.body.appendChild(sparkle);
            
            // Animate sparkle
            const angle = (i / sparkleCount) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const duration = 800 + Math.random() * 400;
            
            sparkle.animate([
                {
                    transform: 'translate(0, 0) scale(0)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => {
                sparkle.remove();
            };
        }
    }
    
    createClickEffect(element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 101, 132, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(ripple);
        
        ripple.animate([
            {
                width: '0px',
                height: '0px',
                opacity: 1
            },
            {
                width: '200px',
                height: '200px',
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => {
            ripple.remove();
        };
    }
}

// Button Animation Effects
class ButtonEffects {
    constructor() {
        this.buttons = document.querySelectorAll('.cta-button');
        this.init();
    }
    
    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createButtonGlow(button);
            });
            
            button.addEventListener('click', (e) => {
                this.createRippleEffect(button, e);
            });
        });
    }
    
    createButtonGlow(button) {
        const glow = document.createElement('div');
        glow.className = 'button-hover-glow';
        glow.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        button.style.position = 'relative';
        button.appendChild(glow);
        
        requestAnimationFrame(() => {
            glow.style.opacity = '1';
        });
        
        button.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
            setTimeout(() => {
                if (glow.parentNode) {
                    glow.remove();
                }
            }, 300);
        }, { once: true });
    }
    
    createRippleEffect(button, event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => {
            ripple.remove();
        };
    }
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero animation
    const heroAnimation = new HeroAnimation();
    
    // Initialize floating icons animation
    const floatingIcons = new FloatingIconsAnimation();
    
    // Initialize button effects
    const buttonEffects = new ButtonEffects();
    
    // Add smooth scrolling for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('.games-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Performance optimization: Reduce animation on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        heroAnimation.config.particleCount = 40;
    }
    
    // Reduce motion for accessibility
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        heroAnimation.config.particleCount = 20;
        heroAnimation.config.particleSpeed = 0.1;
    }
});

// Export for potential external use
window.HeroAnimation = HeroAnimation;