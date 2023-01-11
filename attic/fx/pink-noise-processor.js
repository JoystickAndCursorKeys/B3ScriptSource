// white-noise-processor.js
class PinkNoiseProcessor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return [{ name: 'frequency', defaultValue: 440 }];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const frequency = parameters.frequency;

    //console.log( "freq", frequency );
    //console.log( "outputs.length", outputs.length );
    //console.log( "inputs", inputs.length );

    var b0 = 0;
    var b1 = 0;
    var b2 = 0;
    var b3 = 0;
    var b4 = 0;
    var b5 = 0;
    var b6 = 0;

    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        outputChannel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        outputChannel[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    }

    return true;
  }
}

registerProcessor('pink-noise-occilator', PinkNoiseProcessor)
