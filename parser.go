package gocdp

import (
	"encoding/json"
	"regexp"
	"strings"
)

var gbRegex *regexp.Regexp = regexp.MustCompile(`Gobuster\s+v[0-9]+\.[0-9]+\.[0-9]+`)

type Parser interface {
	Parse(input string) (CDResults, error)
	CanParse(input string) bool
}

type ffufOutput struct {
	CommandLine string `json:"commandline"`
	Results     []struct {
		Url           string `json:"url"`
		Status        int    `json:"status"`
		Redirect      string `json:"redirectlocation"`
		ContentType   string `json:"content-type"`
		ContentLength int    `json:"length"`
	} `json:"results"`
}
type FfufParser struct {
}

func (parser FfufParser) Parse(input string) (CDResults, error) {
	var output ffufOutput
	err := json.Unmarshal([]byte(input), &output)
	if err != nil {
		return nil, err
	}

	var results CDResults
	for _, result := range output.Results {
		results = append(results, CDResult{
			Url:           result.Url,
			Status:        result.Status,
			Redirect:      result.Redirect,
			ContentType:   result.ContentType,
			ContentLength: result.ContentLength,
		})
	}
	return results, nil
}

func (parser FfufParser) CanParse(input string) bool {
	var output ffufOutput
	err := json.Unmarshal([]byte(input), &output)
	if err != nil {
		return false
	}

	return strings.HasPrefix(output.CommandLine, "ffuf")
}

type GobusterParser struct {
}

func (parser GobusterParser) Parse(input string) (CDResults, error) {
	return nil, nil
}

func (parser GobusterParser) CanParse(input string) bool {
	return gbRegex.MatchString(input)
}
