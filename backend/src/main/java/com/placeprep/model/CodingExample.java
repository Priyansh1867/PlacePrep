package com.placeprep.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CodingExample {

    @Column(name = "input_text", columnDefinition = "TEXT")
    private String input;

    @Column(name = "output_text", columnDefinition = "TEXT")
    private String output;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    public CodingExample() {
    }

    public CodingExample(String input, String output, String explanation) {
        this.input = input;
        this.output = output;
        this.explanation = explanation;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
