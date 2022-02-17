package cmd

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"os"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

type noopWriter struct {
}

func (w noopWriter) Write(bytes []byte) (int, error) {
	return 0, nil
}

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "gocdp files...",
	Short: "Content discovery parser",
	Long: `Content discovery parser

Available query functions:

  .IsRedirect
  .IsSuccess
  .IsError
  .IsAuthError
  .IsRateLimit

Available format fields:

  .Url
  .Status
  .Redirect
  .ContentType
  .ContentLength
`,
	Example: `

gocdp ffuf* -q '.IsSuccess' -f '{{.Url}}'
	OR
find ./ -name '*ffuf*' | gocdp - -q '.IsSuccess' -f '{{.Url}}'

Show only the URLs from the results with success status codes


gocdp ffuf* -q '.IsRedirect' -f '{{.Redirect}}'

Show the redirect URLs from the results which were redirected


gocdp ffuf* -q 'not (or .IsRateLimit .IsError)'

Show the JSON output of all results which weren't rate limited or errors


gocdp ffuf* -g

Show the JSON output of all results, grouped by the status code ranges i.e. 200-299, 300-399, etc.
`,
	Args: cobra.MinimumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		results, err := gocdp.SmartParseFiles(files)
		if err != nil {
			return err
		}

		query, _ := cmd.Flags().GetString("query")
		if query != "" {
			var filteredResults gocdp.CDResults
			filterTemplate := template.New("filter")
			funcMap := make(template.FuncMap)
			funcMap["appendMatch"] = func(match gocdp.CDResult) string {
				filteredResults = append(filteredResults, match)
				return ""
			}

			templateString := fmt.Sprintf(`{{range $result := .}}{{if %s}}{{appendMatch $result}}{{end}}{{end}}`, query)
			_, err := filterTemplate.Funcs(funcMap).Parse(templateString)
			if err != nil {
				return err
			}

			err = filterTemplate.Execute(noopWriter{}, results)
			if err != nil {
				return err
			}
			results = filteredResults
		}

		group, _ := cmd.Flags().GetBool("group")
		format, _ := cmd.Flags().GetString("format")
		if format != "" {
			formatTemplate, err := template.New("format").Parse(format)
			if err != nil {
				return err
			}

			for _, result := range results {
				buf := new(bytes.Buffer)
				err = formatTemplate.Execute(buf, result)
				if err != nil {
					return err
				}
				fmt.Println(buf.String())
			}
		} else if group {
			grouped := results.GroupByStatus()

			data, err := json.MarshalIndent(grouped, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(data))
		} else {
			data, err := json.MarshalIndent(results, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(data))
		}

		return nil
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	rootCmd.Flags().StringP("format", "f", "", "golang text/template format to be applied on each result")
	rootCmd.Flags().StringP("query", "q", "", "golang text/template used to filter the results")
	rootCmd.Flags().BoolP("group", "g", false, "group the results by status code")
}
