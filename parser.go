package gocdp

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
)

var gbRegex *regexp.Regexp = regexp.MustCompile(`Gobuster\s+v[0-9]+\.[0-9]+\.[0-9]+`)
var dirbRegex *regexp.Regexp = regexp.MustCompile(`DIRB\s*v[0-9]+\.[0-9]+`)

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

	return output.CommandLine != ""
}

type GobusterParser struct {
}

func (parser GobusterParser) Parse(input string) (CDResults, error) {
	return nil, nil
}

func (parser GobusterParser) CanParse(input string) bool {
	return gbRegex.MatchString(input)
}

type DirbParser struct {
}

func (parser DirbParser) Parse(input string) (CDResults, error) {
	var results CDResults
	isResultRegex := regexp.MustCompile(`^\+\s*`)
	resultRegex := regexp.MustCompile(`^\+\s*(?P<url>https?://[^\s]+)\s*\(CODE:(?P<status>[0-9]+)\|SIZE:(?P<length>[0-9]+)\)`)

	// (Location: '/user/not_authorized')
	redirectRegex := regexp.MustCompile(`^\s*\(Location: '([^']+)'\)`)

	lines := strings.Split(input, "\n")
	for i, line := range lines {
		if !isResultRegex.MatchString(line) {
			continue
		}
		match := resultRegex.FindStringSubmatch(line)

		namedMatches := make(map[string]string)
		for j, name := range resultRegex.SubexpNames() {
			if j != 0 && name != "" {
				namedMatches[name] = match[j]
			}
		}

		status, _ := strconv.Atoi(namedMatches["status"])
		length, _ := strconv.Atoi(namedMatches["length"])

		result := CDResult{
			Url:           namedMatches["url"],
			Status:        status,
			ContentLength: length,
			ContentType:   "",
		}

		if result.IsRedirect() {
			matches := redirectRegex.FindStringSubmatch(lines[i+1])
			if matches[1] != "" {
				result.Redirect = matches[1]
			}
		}

		results = append(results, result)
	}

	return results, nil
}

func (parser DirbParser) CanParse(input string) bool {
	return dirbRegex.MatchString(input)
}
