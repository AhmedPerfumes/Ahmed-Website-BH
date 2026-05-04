"use client";
import React from "react";

export default function Loyalty() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#F9FAFB',
        borderRadius: '24px',
        border: '1px solid #F3F4F6',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h4 style={{ 
          fontSize: '24px', 
          fontWeight: 800, 
          color: '#111', 
          letterSpacing: '-0.02em',
          marginBottom: '8px'
        }}>
          Loyalty Program
        </h4>
        <p style={{ 
          color: '#9CA3AF', 
          fontWeight: 600,
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Coming Soon
        </p>
      </div>
    </div>
  );
}
