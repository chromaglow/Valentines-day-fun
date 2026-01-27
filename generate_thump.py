import wave
import math
import struct

# Params for "Haptic Thump"
# 60Hz is a sweet spot for many phone speakers to resonate
frequency = 60  
duration = 0.2  # seconds
volume = 1.0
sample_rate = 44100

num_samples = int(sample_rate * duration)

with wave.open('assets/audio/thump.wav', 'w') as wav_file:
    wav_file.setnchannels(1) # Mono
    wav_file.setsampwidth(2) # 2 bytes per sample (16-bit)
    wav_file.setframerate(sample_rate)
    
    for i in range(num_samples):
        t = float(i) / sample_rate
        
        # Sine wave
        sample = volume * math.sin(2 * math.pi * frequency * t)
        
        # Apply Envelope (Attack/Decay) for "Thump" not "Beep"
        # Fast attack, exponential decay
        envelope = math.exp(-15 * t) 
        
        final_sample = sample * envelope
        
        # Scale to 16-bit integer
        val = int(final_sample * 32767.0)
        
        # Pack and write
        data = struct.pack('<h', val)
        wav_file.writeframesraw(data)

print("Generated assets/audio/thump.wav")
